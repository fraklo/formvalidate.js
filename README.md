# FormValidate JS

> Simple Form Validation

A simple js drop-in for basic form validation. In plain JS.

**IMPORTANT**: You should never trust client side validation. ALWAYS verify the data on the back end. This is meant to only provide feedback to the user and reduce the number of round trips to the server.

## Basic Setup

Include the script and css located on the `dist` folder

```html
<script src="dist/formvalidate.min.js"></script>
<link href="dist/css/formvalidate.css" rel="stylesheet">
```

Add class to form(s)
```html
<!-- Form -->
<form class="js_form_validate">
</form>
```

Add <code>data-validate</code> attributes to inputs
```html
<input type="text" name="alpha" data-validate="alpha" />
<input type="text" name="email" data-validate="email" />
<input type="checkbox" value="agree" data-required="true" />
```

Add trigger class to submit button
```html
<!-- Standard button -->
<button type="submit" class="js_form_validate_submit">Submit</button>

<!-- OR use any other element as trigger -->
<div class="btn js_form_validate_submit">Submit</div>
```

Instantiate FormValidate
```js
new FormValidate().init();
```

## Checkboxes, Radios and Selects
The only formvalid option here is the required attribute.

Setting a checkbox to required will only validate if the checkbox is checked.
While not necessary, wrapping radios and checkboxes in label tags will make it easier for the user to click the intended target as well as make it easier to style if/when an error occurs.
```html
<!-- Checkbox -->
<label>
  <input type="checkbox" value="agree" data-required="true" />
  <span>I totally agree to yadda yadda yaddda...</span>
</label>
```

Setting a radio to will cause to FormValidate to check any other radio with the same name tag and see if any was checked.
```html
<!-- Radio -->
<label>
  <input type="radio" name="radios" value="on" data-required="true" />
  <span>Turned On</span>
</label>
<label>
  <input type="radio" name="radios" value="off" />
  <span>Turned Off</span>
</label>
```

Selects will only validate against default values. In order for this to work, a default option needs to be provided. This will also give the user some idea of what to do.
```html
<select name="select" autocomplete="off" data-required="true">
  <option disabled="disabled" selected="selected">Select something</option>
  <option value="something">Something</option>
  <option value="not something">Not Something</option>
</select>
```

## A little more complex
```js
var formValidate = new FormValidate();
```

Use this method to instatiate validation on any form you pass in. Useful for when content is dynamically loaded.
```js
formValidate.setForm(form)
```

This method allows you to set filtering on an input. Pass in an input and any of the validation types found below.
```js
formValidate.setInputFiltering(input, validation)
```

This method activates filtering on the inputs within a form.
```js
formValidate.setFormFiltering(form)
```

Programattically trigger the validation of a form. Pass a form as the first paramter. Setting the second parameter to <code>false</code> will return an object with the results.
```js
<!-- Set form to validate and set autoSubmit to false -->
res = formValidate.validateForm(form, false)
<!-- Result -->
// the result will be an object such as this
{isValid: false, ["email", "radios"]}
```

This method allows you to validate an input. Pass in any input and any of the validation types found below.
```js
<!-- Check input against validation type -->
res = formValidate.validateInput(input, validation)
<!-- Result -->
// the result will be a boolean value
false
```

These are the validation types available
```js
// Alhpabet letters only, no spaces or anything else
// abCDefG
"alpha"

// Alhpabet and Digits only, no spaces or anything else
// abcXYZ123
"alpha_num"

// Similar to integer but allows single period
// 98.3858
"decimal"

// Filters out most special characters
// very+simple-mail_filter@staying.easy.com
"email"

// Just digits, no spaces or anything else
// 982398298
"integer"

// Same as alpha but allows space, period, dash
// Billy-Joe Smith Jr.
"name"

// Same as integer but applies US phone format
// 0123456789 -> 012-345-6789
"phone"

// Alphanum with punctuation
"plain_text"
```

## Options
You can change the trigger/style classes that FormValidate will look for and set. Here are the options and the defaults:
```js
// Set this to false if you dont want input filtering on
activeInputFiltering: true,

// This value will be prepended with "data-" to create the data
// validate attribute that FormValidate will use from the inputs
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
// instruct FormValidate to apply the error class to element instead.
errorTarget: 'self',

// Class added to form when form is being processed
processingClass: 'processing',

// This value will be prepended with "data-" to create the
// data required attribute that FormValidate will use to determine
// if an input is required. By default it looks for data-required
requiredTag: 'required',

// This is used to find the submit button that will trigger
// it's parent form
submitClass: 'js_form_validate_submit'
```


