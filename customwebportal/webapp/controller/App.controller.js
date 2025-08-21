sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, Fragment, MessageToast, JSONModel) {
	"use strict";

    return Controller.extend("com.inctue.customwebportal.controller.App", {

        onInit: function () {
            // 🔹 Tiles data
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
                        url: "https://www.sap.com",
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
                        embedMode: "newtab",
                        active: true
                    }
                ]
            };
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "tilesModel");

            var oAnnouncements = {
                announcements: [
                    {
                        title: "Test Important Announcement",
                        date: "5 days ago",
                        category: "Reporting",
                        description: "This is a test important announcement for reporting users."
                    },
                    {
                        title: "System Maintenance Scheduled",
                        date: "July 23",
                        category: "General",
                        description: "System will be down for maintenance from 12 AM to 3 AM."
                    },
                    {
                        title: "New Feature Released",
                        date: "July 20",
                        category: "Planning / Forecasting",
                        description: "We have rolled out a new planning dashboard with enhanced filters."
                    }
                ]
            };
            var oAnnouncementsModel = new JSONModel(oAnnouncements);
            this.getView().setModel(oAnnouncementsModel, "announcementsModel");

            console.log("Tiles Model:", oModel);
            console.log("Announcements Model:", oAnnouncementsModel);
        },

		/**
		 * Event handler for avatar press - opens profile popover
		 */
		onAvatarPress: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

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
                // Check if popover is already open
                if (oPopover.isOpen()) {
                    // Close the popover if it's already open
                    oPopover.close();
                } else {
                    // Open the popover if it's closed
                    oPopover.openBy(oButton);
                }
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
