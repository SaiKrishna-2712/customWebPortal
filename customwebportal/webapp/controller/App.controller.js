sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (Controller, Fragment, MessageToast) {
    "use strict";

    return Controller.extend("com.inctue.customwebportal.controller.App", {
        
        onInit: function () {
            // Initialize any required data here
        },

        /**
         * Event handler for avatar press - opens profile popover
         */
        onAvatarPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();

            // Create popover if it doesn't exist
            if (!this._pPopover) {
                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.inctue.customwebportal.fragments.UserProfilePopover",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            
            this._pPopover.then(function (oPopover) {
                oPopover.openBy(oButton);
            });
        },

        
    });
});