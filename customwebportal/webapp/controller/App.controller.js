sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, Fragment, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("com.inctue.customwebportal.controller.App", {

        onInit: function () {
            // Initialize iframe timeout variable
            this._iframeLoadTimeout = null;
            
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
                        embedMode: "newtab",
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
         * Handle tile press event with iframe loading and fallback to new tab
         * @param {sap.ui.base.Event} oEvent - The tile press event
         */
        onTilePress: function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext("tilesModel");
            if (!oContext) {
                MessageToast.show("No data found for this tile");
                return;
            }

            var oData = oContext.getObject();
            var sUrl = oData.url;
            var sEmbedMode = oData.embedMode;
            var sTitle = oData.title || "Application";

            if (!sUrl) {
                MessageToast.show("Application URL not found");
                return;
            }

            // Check if embed mode is explicitly set to "newtab"
            if (sEmbedMode === "newtab") {
                this._openInNewTab(sUrl, sTitle);
                return;
            }

            // Try to load in iframe, with fallback to new tab
            this._loadInIframe(sUrl, sTitle);
        },

        /**
         * Load application in iframe with fallback mechanism
         * @param {string} sUrl - Application URL
         * @param {string} sTitle - Application title
         */
        _loadInIframe: function(sUrl, sTitle) {
            // Hide tiles and show iframe container
            this.byId("idApplicationsTileContainerFlxBx").setVisible(false);
            
            var oVBox = this.byId("idIFrameContainerVBx");
            oVBox.removeAllItems();
            oVBox.setVisible(true);

            // Show loading indicator
            this._showLoadingMessage("Loading " + sTitle + "...");
            
            // Clear any existing timeout
            if (this._iframeLoadTimeout) {
                clearTimeout(this._iframeLoadTimeout);
            }

            var that = this;
            var bLoaded = false;
            var sIframeId = "idEmbeddediFrame_" + Date.now(); // Unique ID

            // Create iframe with enhanced attributes
            var sIframeContent = "<div style='position:relative;width:100%;height:90vh;'>" +
                "<iframe id='" + sIframeId + "' " +
                "src='" + sUrl + "' " +
                "style='width:100%;height:100%;border:none;' " +
                "sandbox='allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox' " +
                "loading='eager'>" +
                "<p>Your browser does not support iframes.</p>" +
                "</iframe>" +
                "<div id='loadingOverlay_" + sIframeId + "' style='position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;font-size:16px;'>Loading...</div>" +
                "</div>";

            var oIframe = new sap.ui.core.HTML({
                content: sIframeContent
            });
            oVBox.addItem(oIframe);

            // Set timeout for fallback (10 seconds)
            this._iframeLoadTimeout = setTimeout(function() {
                if (!bLoaded) {
                    console.log("❌ Iframe timeout for: " + sUrl);
                    MessageToast.show("Application failed to load. Opening in new tab...");
                    that._openInNewTab(sUrl, sTitle);
                }
            }, 10000);

            // Wait for DOM to be ready, then attach event handlers
            setTimeout(function() {
                var iframe = document.getElementById(sIframeId);
                var loadingOverlay = document.getElementById('loadingOverlay_' + sIframeId);
                
                if (!iframe) {
                    console.error("Iframe not found in DOM");
                    that._openInNewTab(sUrl, sTitle);
                    return;
                }

                // Success handler
                var fnOnLoad = function() {
                    if (bLoaded) return; // Prevent multiple calls
                    bLoaded = true;
                    clearTimeout(that._iframeLoadTimeout);
                    
                    // Hide loading overlay
                    if (loadingOverlay) {
                        loadingOverlay.style.display = 'none';
                    }
                    
                    console.log("✅ Iframe loaded successfully: " + sUrl);
                    MessageToast.show(sTitle + " loaded successfully");
                    
                    // Additional verification after a short delay
                    setTimeout(function() {
                        that._verifyIframeContent(iframe, sUrl, sTitle);
                    }, 2000);
                };

                // Error handler
                var fnOnError = function() {
                    if (bLoaded) return; // Prevent multiple calls
                    bLoaded = true;
                    clearTimeout(that._iframeLoadTimeout);
                    
                    console.log("❌ Iframe error for: " + sUrl);
                    MessageToast.show("Failed to load " + sTitle + ". Opening in new tab...");
                    that._openInNewTab(sUrl, sTitle);
                };

                // Attach event handlers
                iframe.onload = fnOnLoad;
                iframe.onerror = fnOnError;
                
                // Additional error detection for blocked content
                iframe.addEventListener('load', function() {
                    // Check if iframe was redirected to an error page
                    setTimeout(function() {
                        try {
                            var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                            if (iframeDoc && iframeDoc.title && 
                                (iframeDoc.title.toLowerCase().includes('error') || 
                                 iframeDoc.title.toLowerCase().includes('blocked'))) {
                                throw new Error('Error page detected');
                            }
                        } catch (e) {
                            // Cross-origin restrictions - this is expected for external sites
                            // Don't treat this as an error
                            console.log("Cross-origin iframe - cannot verify content");
                        }
                    }, 1000);
                });

            }, 100);
        },

        /**
         * Open application in new tab
         * @param {string} sUrl - Application URL
         * @param {string} sTitle - Application title
         */
        _openInNewTab: function(sUrl, sTitle) {
            try {
                var oNewWindow = window.open(sUrl, '_blank', 'noopener,noreferrer');
                
                if (!oNewWindow) {
                    MessageToast.show("Popup blocked. Please allow popups for this site and try again.");
                } else {
                    MessageToast.show("Opening " + sTitle + " in new tab...");
                }
            } catch (e) {
                MessageToast.show("Failed to open application: " + e.message);
            }
        },

        /**
         * Show loading message
         * @param {string} sMessage - Loading message to show
         */
        _showLoadingMessage: function(sMessage) {
            MessageToast.show(sMessage);
        },

        /**
         * Logo press handler - return to tiles view
         */
        onLogoPress: function () {
            this.byId("idApplicationsTileContainerFlxBx").setVisible(true);

            const oVBox = this.byId("idIFrameContainerVBx");
            oVBox.removeAllItems();
            oVBox.setVisible(false);
            
            // Clear any pending timeouts
            if (this._iframeLoadTimeout) {
                clearTimeout(this._iframeLoadTimeout);
                this._iframeLoadTimeout = null;
            }
        },

        /**
         * Announcement press handler
         */
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

        /**
         * Update announcement styles based on read status
         */
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

        /**
         * View all announcements handler
         */
        onViewAllPress: function () {
            sap.m.MessageToast.show("View All Announcements Pressed");
        },

        /**
         * Verify iframe content after loading
         * @param {HTMLElement} iframe - The iframe element
         * @param {string} sUrl - Original URL
         * @param {string} sTitle - Application title
         */
        _verifyIframeContent: function(iframe, sUrl, sTitle) {
            try {
                // Try to access iframe content
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                if (!iframeDoc) {
                    throw new Error("Cannot access iframe document");
                }
                
                // Check for common error indicators
                var bodyContent = iframeDoc.body ? iframeDoc.body.textContent || iframeDoc.body.innerText : "";
                var docTitle = iframeDoc.title || "";
                
                if (bodyContent.toLowerCase().includes("frame") && bodyContent.toLowerCase().includes("denied") ||
                    docTitle.toLowerCase().includes("denied") ||
                    docTitle.toLowerCase().includes("refused")) {
                    
                    throw new Error("Frame access denied");
                }
                
            } catch (e) {
                // Most external sites will throw cross-origin errors - this is normal
                // Only treat specific cases as actual errors
                if (e.message.includes("denied") || e.message.includes("refused")) {
                    console.log("❌ Iframe blocked by X-Frame-Options: " + sUrl);
                    MessageToast.show(sTitle + " cannot be embedded. Opening in new tab...");
                    this._openInNewTab(sUrl, sTitle);
                } else {
                    // Cross-origin restriction - normal behavior, assume success
                    console.log("✅ Iframe loaded (cross-origin restrictions prevent verification): " + sUrl);
                }
            }
        },        /**
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
    });
});