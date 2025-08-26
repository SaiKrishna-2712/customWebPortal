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
            var oTilesData = {
                tiles: [
                    {
                        ID: "1",
                        title: "Google",
                        subtitle: "Search Engine",
                        url: "https://www.google.com",
                        icon: "sap-icon://world",
                        embedMode: "iframe",
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
                        title: "Topas Cherrywork",
                        subtitle: "Timesheet",
                        url: "https://topas.cherrywork.com/home/dashboard",
                        icon: "sap-icon://employee",
                        embedMode: "iframe",
                        active: true
                    },
                    {
                        ID: "4",
                        title: "Example webpage",
                        subtitle: "example",
                        url: "https://www.wikipedia.org",
                        icon: "sap-icon://employee",
                        embedMode: "iframe",
                        active: true
                    },
                    {
                        ID: "5",
                        title: "Zoho People",
                        subtitle: "HR resources",
                        url: "https://www.zoho.com/people/",
                        icon: "sap-icon://employee",
                        embedMode: "iframe",
                        active: true
                    }
                ]
            };
            var oTilesModel = new JSONModel(oTilesData);
            this.getView().setModel(oTilesModel, "tilesModel");

            // 🔹 Announcements data
            var oAnnouncementsModel = new JSONModel();
            oAnnouncementsModel.loadData(
                sap.ui.require.toUrl("com/inctue/customwebportal/model/announcements.json")
            );
            this.getView().setModel(oAnnouncementsModel, "announcementsModel");

            oAnnouncementsModel.attachRequestCompleted(() => {
                const announcements = oAnnouncementsModel.getProperty("/announcements") || [];
                announcements.forEach(a => {
                    a.read = false;
                    a.expanded = false;
                    a.previousExpanded = false;
                });
                oAnnouncementsModel.setProperty("/announcements", announcements);
                this._updateAnnouncementStyles();
            });

            console.log("Tiles Model:", oTilesModel);
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
                if (oPopover.isOpen()) {
                    oPopover.close();
                } else {
                    oPopover.openBy(oButton);
                }
            });
        },

        onTilePress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("tilesModel");
            var oData = oContext.getObject();
            var that = this;

            if (oData.embedMode === "newtab") {
                window.open(oData.url, "_blank");
            } else {
                this.byId("idApplicationsTileContainerFlxBx").setVisible(false);

                var oVBox = this.byId("idIFrameContainerVBx");
                oVBox.removeAllItems();
                oVBox.setVisible(true);

                var oIframe = new sap.ui.core.HTML({
                    content: "<iframe id='idEmbeddediFrame' src='" + oData.url + "' style='width:100%;height:90vh;border:none;'></iframe>"
                });

                oVBox.addItem(oIframe);

                setTimeout(function () {
                    try {
                        // Try accessing iframe document (will fail if blocked)
                        var iframeEl = document.getElementById("idEmbeddediFrame");
                        var test = iframeEl.contentWindow.location.href;

                        // If access allowed → fine
                        console.log("Iframe loaded:", test);
                    } catch (err) {
                        console.warn("Iframe blocked, falling back to new tab", err);
                        window.open(oData.url, "_blank");
                        // Optionally remove iframe if blocked
                        that.onLogoPress();
                        oVBox.removeAllItems();
                    }
                }, 1000);


            }
        },

        onLogoPress: function () {
            this.byId("idApplicationsTileContainerFlxBx").setVisible(true);

            const oVBox = this.byId("idIFrameContainerVBx");
            oVBox.removeAllItems();
            oVBox.setVisible(false);
        },

        onAnnouncementPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oCtx = oItem.getBindingContext("announcementsModel");
            const sPath = oCtx.getPath();
            const oModel = oCtx.getModel();

            const announcements = oModel.getProperty("/announcements");
            const clicked = oModel.getProperty(sPath);

            clicked.expanded = !clicked.expanded;
            if (clicked.expanded) {
                clicked.read = true;
                clicked.previousExpanded = false;
            } else {
                clicked.previousExpanded = true;
            }

            oModel.setProperty("/announcements", announcements);
            this._updateAnnouncementStyles();
        },

        _updateAnnouncementStyles: function () {
            const oList = this.byId("idAnnouncementsLst");
            if (!oList) return;

            const oModel = this.getView().getModel("announcementsModel");
            const aItems = oList.getItems();

            aItems.forEach(oItem => {
                const oCtx = oItem.getBindingContext("announcementsModel");
                if (!oCtx) return;

                const data = oModel.getProperty(oCtx.getPath());
                if (!data) return;

                const oMainHBox = oItem.getContent()[0];
                const oContainerBox = oMainHBox.getItems()[1]; // content VBox
                const oLineVBox = oMainHBox.getItems()[0].getItems()[0]; // vertical line

                oLineVBox.removeStyleClass("lineBlue");
                oLineVBox.removeStyleClass("lineLightGray");
                oLineVBox.addStyleClass(data.read ? "lineLightGray" : "lineBlue");

                const applyStyle = ctrl => {
                    if (!ctrl) return;
                    ctrl.removeStyleClass("announcementTextUnread");
                    ctrl.removeStyleClass("announcementTextRead");
                    ctrl.addStyleClass(data.read ? "announcementTextRead" : "announcementTextUnread");

                    if (ctrl.getItems && typeof ctrl.getItems === "function") {
                        ctrl.getItems().forEach(applyStyle);
                    }
                };
                if (oContainerBox && oContainerBox.getItems) {
                    oContainerBox.getItems().forEach(applyStyle);
                }
            });
        },

        onViewAllPress: function () {
            sap.m.MessageToast.show("View All Announcements Pressed");
        }
    });
});
