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

});
