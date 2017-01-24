 domReady(function () {

 		/**
     * Birthday input mask
     */
    new InputMask().Initialize(document.querySelectorAll("#reportee_birthdate"), {
        mask: InputMaskDefaultMask.Date,
        placeHolder: "01/01/2017"
    });

    /**
     * Form validations
     */
    var validatinator = new Validatinator({
        "formSurvey": {
            "user_email": "email",
            "reportee_name": "required",
            "address": "required",
            "district": "required",
            "probable_cause": "required",
            "reportee_mother_name": "required"
        }
    });

    /**
     * Send data
     */
    var form = document.querySelector('form[name="formSurvey"]');
    customAddEventListener(form, 'submit', function (e) {
        /**
         * Prevent form to submit
         */
        e.preventDefault();

        /**
         * Remove all errors before validation
         */
        customForEachElement('.input-error', function (input, key) {
            customRemoveClass(input, 'input-error');
        });

        var formId = "formSurvey";
        if (validatinator.fails(formId)) {
            for (var inputId in validatinator.errors[formId]) {
                (function (id) {
                    var input = document.getElementsByName(id)[0];
                    var parent = customGetClosest(input, '.form-group');
                    customAddClass(parent, 'input-error');
                    input.focus();
                })(inputId);
            }
        } else {
            var formData = collectFormData(form);
            document.body.className = 'state-submitting';

            aja()
                .url(LANDING_API_URL + '/v1/reports')
                .method('post')
                .body(formData)
                .type('json')
                .on('success', function () {
                    document.body.className = 'state-submitted-successfully';
                })
                .on('422', function (response) {
                    response = JSON.parse(response);
                    document.body.className = 'state-not-submitted state-failed-to-submit';
                    switch (response.type) {
                        case 'not_found':
                            var emailInput = document.getElementsByName('user_email')[0];
                            var parent = customGetClosest(emailInput, '.form-group');
                            document.getElementById('error-message').innerHTML = response.error;
                            customAddClass(parent, 'input-error');
                            emailInput.focus();
                            break;
                        case 'params':
                            for (var fieldName in response.error) {
                                var input = document.getElementsByName(fieldName)[0];
                                var parent = customGetClosest(input, '.form-group');
                                customAddClass(parent, 'input-error');
                            }
                            document.getElementById('error-message').innerHTML = 'Por favor, verifique os campos destacados abaixo.';
                            break;
                        default:
                            document.getElementById('error-message').innerHTML = response.error;
                            break;
                    }
                }).go();
        }
    });
});
