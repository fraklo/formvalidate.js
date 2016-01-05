;(function() {
  "use strict";
  window.FormValidate = function(opts) {
    var options,
        defaults = {

          // Set this to false if you dont want input filtering on
          activeInputFiltering: true,

          // This value will be prepended with "data-" to create the data
          // validate attribute that formvalidate will use from the inputs
          // it finds. By default it looks for data-validate
          dataTag: 'validate',

          // This is used to find forms to validate
          formClass: 'js_form_validate',

          // Class added to forms that validate successfully
          formSuccessClass: 'validate-success',

          // Class added to targets that fail validation
          errorClass: 'error',

          // Sets target to apply the error class on failed validation.
          // Setting a class (i.e. input-wrapper) of a parent element will
          // instruct formvalidate to apply the error class to element instead.
          errorTarget: 'self',

          // Class added to form when form is being processed
          processingClass: 'processing',

          // This value will be prepended with "data-" to create the
          // data required attribute that formvalidate will use to determine
          // if an input is required. By default it looks for data-required
          requiredTag: 'required',

          // This is used to find the submit button that will trigger
          // it's parent form
          submitClass: 'js_form_validate_submit'
        },
        filterTypes = ["alpha", "alpha_num", "decimal", "email", "integer",
                       "name", "phone", "plain_text"];

    if(opts && typeof opts === "object") {
      options = extendOptions(defaults, opts);
    } else {
      options = defaults;
    }


    // Private Methods
    function extendOptions(source, properties) {
      var property;

      for(property in properties) {
        if(properties.hasOwnProperty(property)) {
          source[property] = properties[property];
        }
      }
      return source;
    }


    // Auto initiates any form that contains the formClass class
    function init() {
      var formClass, forms, i;

      // Get all forms
      forms = document.getElementsByClassName(options.formClass);
      for(i = 0; i < forms.length; i++) {
        setForm(forms[i]);
      }
    }


    // Applies active input filtering to inputs
    function setInputFiltering(input, type) {
      if(!type) {
        type = input.getAttribute('data-'+options.dataTag);
      }
      // Input has type and type is in filterTypes list
      if(type && filterTypes.indexOf(type) >= 0) {
        // Apply active filtering
        input.addEventListener('keyup', function(e) {
          var el = e.target;
          el.value = validateStr(el.value, type, true);
        });
      }
    }


    // Sets up the given form for validation
    // also initiates active validation if needed
    function setForm(form) {
      var formEls, j, submitBtn;

      setFormSubmitListener(form);

      // Get form valid form inputs (sans radios/checkboxes)
      formEls = form.querySelectorAll('input,textarea,select');
      for(j = 0; j < formEls.length; j++) {
        var input = formEls[j];

        if(options.activeInputFiltering ||
                input.getAttribute('data-active-validation')) {
          setInputFiltering(input);
        }
      }

      // Get form submit button
      // Should be only one, so grab that one
      submitBtn = form.getElementsByClassName(options.submitClass)[0];

      submitBtn.addEventListener('click', function(e) {
        // Remove success in case of re-validation/ new info
        form.className = form.className.replace(options.formSuccessClass, '');

        // If form is not already being processed
        if(form.className.indexOf(options.processingClass) < 0) {

          // Add processing class
          form.className = form.className+' '+options.processingClass;
          validateForm(form, formEls, true);
        }
      });
    }


    // Sets form submit listener to prevent submission
    function setFormSubmitListener(form) {
      var formClass = form.className.toLowerCase(),
          formSuccessClass = options.formSuccessClass.toLowerCase();

      form.addEventListener('submit', function(e) {
        if(formClass.indexOf(formSuccessClass) < 0) {
          e.preventDefault();
        }
      });
    }


    // Validates form
    // Loops through all elements in form and checks validity
    // based on data-validate tag
    function validateForm(form, inputs, autoSubmit) {
      var el, i, inputValid,
          radioCheck = {},
          resultObj = {
            isValid: true,
            errors: []
          };

      for(i = 0; i < inputs.length; i++) {
        el = inputs[i];
        if(el.type.toLowerCase() === 'radio') {
          if(el.getAttribute('data-'+options.requiredTag)) {
            radioCheck[el.name] = true;
          }
        } else {
          inputValid = validateInput(el);
          if(!inputValid) {
            resultObj.isValid = false;
            if(el.name) {
              resultObj.errors.push(el.name);
            }
          }
        }
      }
      for(var key in radioCheck) {
        if (!radioCheck.hasOwnProperty(key)) continue;
        if(!setRadioError(key)) {
          resultObj.errors.push(key);
          resultObj.isValid = false;
        }
      }
      if(resultObj.isValid) {
        // Form is good, replace processing class with success
        form.className = form.className.replace(options.processingClass,
                                               options.formSuccessClass);
      } else {
        // Remove processing class
        form.className = form.className.replace(options.processingClass, '');
      }
      if(autoSubmit && resultObj.isValid) {
        form.submit();
      } else {

        return resultObj;
      }
    }


    // Validates input
    // will use data-validate attribute if no validation is provided
    function validateInput(el, validation, isRequired) {
      var inputValid, type;

      if(isRequired || el.getAttribute('data-'+options.requiredTag)) {
        isRequired = true;
      }
      type = el.tagName.toLowerCase() === 'select' ? 'select' :
                                                      el.type.toLowerCase();
      inputValid = true;
      if(type === 'select') {
        if(isRequired &&
                el.selectedIndex === 0) {
          inputValid = false;
        }
      } else if(type === 'radio') {
        if(isRequired) {
          inputValid = setRadioError(el.name);
        }
      } else {
        if(!validation) {
          validation = el.getAttribute('data-' + options.dataTag);
        }
        if(type === 'checkbox' && isRequired) {
          inputValid = validateCheckbox(el);
        } else if(validation && filterTypes.indexOf(validation) >= 0) {

          // Check for empty value
          if(el.value.length === 0) {

            // If value is required invalidate input
            if(isRequired) {
              inputValid = false;
            }
          } else {
            inputValid = validateStr(el.value, validation);
          }
        }
      }
      if(!inputValid) {
        setError(el);
      }

      return inputValid;
    }


    // Sets appropriate filter based on type
    function validateStr(str, validation, isFilter) {
      switch (validation) {
        case "alpha":
          str = validateAlpha(str, isFilter);
          break;
        case "alpha_num":
          str = validateAlphaNum(str, isFilter);
          break;
        case "decimal":
          str = validateDecimal(str, isFilter);
          break;
        case "email":
          str = validateEmail(str, isFilter);
          break;
        case "integer":
          str = validateInteger(str, isFilter);
          break;
        case "name":
          str = validateName(str, isFilter);
          break;
        case "phone":
          str = validatePhone(str, isFilter);
          break;
        case "plain_text":
          str = validatePlainText(str, isFilter);
          break;
      }

      return str;
    }


    //// Validation/Filtering functions ////

    // Alhpabet letters only, no spaces or anything else
    // abCDefG
    function validateAlpha(str, isFilter) {
      var regex = /[^a-zA-Z]/g;

      if(isFilter) {
        str = str.replace(regex, '');
      } else {
        regex = /^[a-zA-Z]+$/;
        str = regex.test(str);
      }

      return str;
    }


    // Alhpabet and Digits only, no spaces or anything else
    // abcXYZ123
    function validateAlphaNum(str, isFilter) {
      var regex = /[^a-zA-Z0-9]/g;

      if(isFilter) {
        str = str.replace(regex, '');
      } else {
        regex = /^[a-zA-Z0-9]+$/;
        str = regex.test(str);
      }

      return str;
    }


    // Similar to integer but allows single period
    // 98.3858
    function validateDecimal(str, isFilter) {
      var index,
          regex = /[^0-9.]/g;

      if(isFilter) {
        str = str.replace(regex, '');
        index = str.indexOf('.');
        if(index >= 0) {
          str = str.slice(0, index)+'.'+str.slice(index).replace(/[.]/g, '');
        }
      } else {
        regex = /^\d+(\.\d+)/;
        str = regex.test(str);
      }

      return str;
    }


    // Filters out most special characters
    // very+simple-mail_filter@staying.easy.com
    function validateEmail(str, isFilter) {
      var regex = /[^\w-@\.\+]/g;

      if(isFilter) {
        str = str.replace(regex, '');
      } else {
        regex = /^([\w-\.\+]+@([\w-]+\.)+[\w-]{2,})?$/;
        str = regex.test(str);
      }

      return str;
    }


    // Just digits, no spaces or anything else
    // 982398298
    function validateInteger(str, isFilter) {
      var regex = /[^\d]/g;

      if(isFilter) {
        str = str.replace(regex, '');
      } else {
        regex = /^[\d]+$/;
        str = regex.test(str);
      }

      return str;
    }


    // Same as alpha but allows space, period, dash
    // Billy-Joe Smith Jr.
    function validateName(str, isFilter) {
      var regex = /[^-.\sa-zA-Z]/g;

      if(isFilter) {
        str = str.replace(regex, '');
      } else {
        regex = /^([-.\sa-zA-Z])/;
        str = regex.test(str);
      }

      return str;
    }


    // Same as integer but applies US phone format
    // 0123456789 -> 012-345-6789
    function validatePhone(str, isFilter) {
      var regex,
          maxDigits = 10,
          str = validateInteger(str, true),
          spacer = '-';

      if(isFilter) {
        if(str.length >= maxDigits) {
          str = str.replace(/(\d{3})(\d{3})(\d{4})/,
                            "$1"+spacer+"$2"+spacer+"$3");
          str = str.substring(0, maxDigits + 2);
        } else if(str.length > 6) {
          str = str.replace(/(\d{3})(\d{3})/,
                            "$1"+spacer+"$2"+spacer);
        } else {
          str = str.replace(/(\d{3})/,
                            "$1"+spacer);
        }
      } else {
        regex = /(\d{3})(\d{3})(\d{4})/;
        if(str.length === maxDigits && regex.test(str)) {
          str = true;
        } else {
          str = false;
        }
      }

      return str;
    }


    // Alphanum with punctuation
    function validatePlainText(str, isFilter) {
      var result,
          regex = /[^\w-.!@#$%&*()+?;:,'\s]/g;

      if(isFilter) {
        result = str.replace(regex, '');
      } else {
        regex = /^([\w-.!@#$%&*()+?;:,'\s])/;
        result = regex.test(str);
      }

      return result;
    }


    // Checks if checkbox is checked
    function validateCheckbox(el) {
      return el.checked;
    }


    // Remove error
    function removeError(e) {
      var el = e.target,
          elError = el;
      if(options.errorTarget !== 'self') {
        elError = getParentWithClass(el, options.errorTarget);
      }

      if(el.type.toLowerCase() === 'radio') {
        removeRadioError(el.name);
      } else {
        elError.className = elError.className.replace(' '+options.errorClass,
                                                      '');
        el.removeEventListener('focus', setError, false);
      }
    }


    // Remove radio error
    // radio needs special attention because of grouped nature
    function removeRadioError(radioName) {
      var i, el, elError,
          radios = document.getElementsByName(radioName);

      for(i = 0; i < radios.length; i++) {
        el = radios[i];
        elError = el;
        if(options.errorTarget !== 'self') {
          elError = getParentWithClass(el, options.errorTarget);
        }
        elError.className = elError.className.replace(' '+options.errorClass,
                                                      '');
        el.removeEventListener('focus', setError, false);
      }
    }


    // Set error on element
    function setError(el) {
      var elError = el;

      if(options.errorTarget !== 'self') {
        elError = getParentWithClass(el, options.errorTarget);
      }
      if(elError.className.indexOf(options.errorClass) < 0) {
        elError.className = elError.className+' '+options.errorClass;
        el.addEventListener('focus', removeError, false);
      }
    }


    // Sets error on radio
    // radio needs special attention because of grouped nature
    function setRadioError(radioName) {
      var i,
          radios = document.getElementsByName(radioName),
          result = false;
      for(i = 0; i < radios.length; i++) {
        if(radios[i].checked) {
          result = true;
          break;
        }
      }
      if(result === false) {
        for(i = 0; i < radios.length; i++) {
          setError(radios[i]);
        }
      }

      return result;
    }


    // Gets the index of string withing an array
    function indexOf(needle) {

      // Check to see if browser has support
      if(typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
      } else {

        // Browser lacks support, recreate function
        indexOf = function(needle) {
          var i = -1, index = -1;
          for(i = 0; i < this.length; i++) {
            if(this[i] === needle) {
              index = i;
              break;
            }
          }
          return index;
        };
      }

      return indexOf.call(this, needle);
    }


    // Gets the parent of element that contains given class
    function getParentWithClass(el, needleClass) {
      var elClass;
      needleClass = needleClass.toLowerCase();
      while(el.parentNode) {
        elClass = el.className.toLowerCase();
        if(elClass.indexOf(needleClass) > -1) {
          break;
        }
        el = el.parentNode;
      }


      return el;
    }


    // Hooks for Public Methods
    this.form__init = function() {
      init();
    }

    this.form__setForm = function(form) {
      setForm(form);
    }

    this.form__setInputFiltering = function(input, validation) {
      setInputFiltering(input, validation);
    }

    this.form__validateForm = function(form, autoSubmit) {
      var inputs = form.querySelectorAll('input,textarea,select');
      setFormSubmitListener(form);

      return validateForm(form, inputs, autoSubmit);
    }

    this.form__validateInput = function(input, validation) {
      return validateInput(input, validation, true);
    }
  }


  // Public Methods
  FormValidate.prototype.init = function() {
    this.form__init();
  }

  FormValidate.prototype.setForm = function(form) {
    var i;
    for(i = 0; i < form.length; i++) {
      this.form__setForm(form[i]);
    }
  }

  FormValidate.prototype.setInputFiltering = function(input, validation) {
    var i;
    for(i = 0; i < input.length; i++) {
      this.form__setInputFiltering(input[i], validation);
    }
  }

  FormValidate.prototype.validateForm = function(form, autoSubmit) {
    var i, result;
    for(i = 0; i < form.length; i++) {
      result = this.form__validateForm(form[i], autoSubmit);
    }

    return result;
  }

  FormValidate.prototype.validateInput = function(input, validation) {
    var i;

    return this.form__validateInput(input[0], validation);
  }
}());
