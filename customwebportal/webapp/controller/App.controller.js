sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, Fragment, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("com.inctue.customwebportal.controller.App", {

		onInit: function () {
			// Initialize any required data here
			var oData = {
				tiles: [
					{
						ID: "1",
						title: "Google",
						subtitle: "Search Engine",
						url: "https://www.google.com",
						icon: "sap-icon://world",
						embedMode: "newtab",
						active: true
					},
					{
						ID: "2",
						title: "SAP",
						subtitle: "SAP Official",
						url: "https://people.zoho.com/",
						icon: "sap-icon://hint",
						embedMode: "iframe",
						active: true
					},
					{
						ID: "3",
						title: "Employee Portal",
						subtitle: "HR resources",
						url: "https://topas.cherrywork.com/home/dashboard",
						icon: "sap-icon://employee",
						embedMode: "iframe",
						active: true
					}
				]
			};

			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel, "tilesModel");
			console.log(oModel)
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

		onTilePress: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("tilesModel");
			var oData = oContext.getObject();

			if (oData.embedMode === "newtab") {
				// Open in new tab
				window.open(oData.url, "_blank");
			} else {
				this.byId("tileContainer").setVisible(false);
				// this.byId("idMainPage").setTitle(""); // hide page title
				const oFrame = this.byId("appFrame");

				oFrame.setVisible(true);
				oFrame.setContent(
					`<iframe src="${oData.url}" 
                     style="width:100%; height:90vh; border:none">
            		</iframe>`
				);
			}
		},

		onLogoPress: function (oEvent) {
			this.byId("tileContainer").setVisible(true);
			// this.byId("idMainPage").setTitle(""); // hide page title
			const oFrame = this.byId("appFrame");
			oFrame.setContent("<html><body></body></html>"); // clears inner content
			oFrame.setVisible(false);
		}

	});
});