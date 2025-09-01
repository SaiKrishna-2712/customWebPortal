sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/GenericTile",
    "sap/m/TileContent",
    "sap/m/ImageContent",
    "sap/ui/layout/GridData"
], function (Controller, Fragment, MessageToast, JSONModel, GenericTile, TileContent, ImageContent, GridData) {
    "use strict";

    return Controller.extend("com.inctue.customwebportal.controller.App", {

        onInit: function () {
            // Initialize iframe timeout variable
            this._iframeLoadTimeout = null;

            // Tiles data - Added more tiles for testing scroll functionality
            var oTilesData = {
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
                        embedMode: "newtab",
                        active: true
                    },
                    {
                        ID: "3",
                        title: "Topas Cherrywork",
                        subtitle: "Timesheet",
                        url: "https://topas.cherrywork.com/home/dashboard",
                        icon: "sap-icon://employee",
                        embedMode: "newtab",
                        active: true
                    },
                    {
                        ID: "4",
                        title: "Microsoft",
                        subtitle: "Productivity Suite",
                        url: "https://www.microsoft.com",
                        icon: "sap-icon://collaborate",
                        embedMode: "newtab",
                        active: true
                    },
                    {
                        ID: "5",
                        title: "Analytics",
                        subtitle: "Data Insights",
                        url: "https://www.analytics.com",
                        icon: "sap-icon://business-objects-experience",
                        embedMode: "newtab",
                        active: true
                    },
                    {
                        ID: "6",
                        title: "CRM System",
                        subtitle: "Customer Management",
                        url: "https://www.crm.com",
                        icon: "sap-icon://customer",
                        embedMode: "iframe",
                        active: true
                    },
                    {
                        ID: "7",
                        title: "Knowledge Base",
                        subtitle: "Documentation",
                        url: "https://www.kb.com",
                        icon: "sap-icon://database",
                        embedMode: "newtab",
                        active: true
                    },
                    {
                        ID: "8",
                        title: "Project Manager",
                        subtitle: "Task Management",
                        url: "https://www.projectmanager.com",
                        icon: "sap-icon://task",
                        embedMode: "newtab",
                        active: true
                    }
                ]
            };
            var oTilesModel = new JSONModel(oTilesData);
            this.getView().setModel(oTilesModel, "tilesModel");

            // Quick Links data
            var oQuickLinksData = {
                links: [
                    {
                        ID: "ql1",
                        text: "A page with Schedule",
                        action: "onSchedulePress",
                        active: true
                    },
                    {
                        ID: "ql2",
                        text: "Access Pharm & Vision Planning Calendars",
                        action: "onCalendarPress",
                        active: true
                    },
                    {
                        ID: "ql3",
                        text: "Find a DTP for gCraft, iRIS, or SCA",
                        action: "onDTPPress",
                        active: true
                    },
                    {
                        ID: "ql4",
                        text: "Overview: Fast Facts About Vital",
                        action: "onOverviewPress",
                        active: true
                    }
                ]
            };
            var oQuickLinksModel = new JSONModel(oQuickLinksData);
            this.getView().setModel(oQuickLinksModel, "quickLinksModel");
            // Create tiles programmatically
            this._createTiles();

            //  Announcements data
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

            // Set up responsive scroll container behavior
            this._setupResponsiveScrollContainer();

            // Initialize knowledge articles
            this._initializeKnowledgeArticles();

            // Initialize banner model with responsive data
            var oBannerModel = new sap.ui.model.json.JSONModel({
                dateTemp: "",
                userName: "Das Tejesh"
            });
            this.getView().setModel(oBannerModel, "bannerModel");

            this._setDateAndTemp(oBannerModel);

            // Handle window resize for responsive behavior
            this._attachResizeHandler();

            const oVBox = this.byId("faqList");

            // Array of FAQs
            const aFAQs = [
                { question: "What is Workzone Advanced?", answer: "SAP Build Work Zone, advanced edition, is a digital workplace solution that empowers users to access business applications, processes, and information from a single, unified entry point." },
                { question: "What are the roles in SAP Build Work Zone, advanced edition?", answer: "There are three types of roles in SAP Build Work Zone, advanced edition: default roles that are assigned automatically during the onboarding process, local roles that are created manually to allow access to local apps, and remote roles that are added from remote content providers" },
                { question: "What is the benefit of SAP work zone?", answer: "SAP Work Zone includes built- in launchpad and allows to access all business apps from one place. Identity propagation eliminates a need to setup additional security roles for SAP business apps." },
                { question: "What is the benefit of SAP work zone?", answer: "SAP Work Zone includes built- in launchpad and allows to access all business apps from one place. Identity propagation eliminates a need to setup additional security roles for SAP business apps." },
                { question: "What is the benefit of SAP work zone?", answer: "SAP Work Zone includes built- in launchpad and allows to access all business apps from one place. Identity propagation eliminates a need to setup additional security roles for SAP business apps." }

            ];

            // Loop through FAQs and create panels
            aFAQs.forEach(faq => {
                // Create Text control with custom style class
                const oText = new sap.m.Text({
                    text: faq.answer
                });
                // Create expandable panel with the text
                const oPanel = new sap.m.Panel({
                    headerText: faq.question,
                    expandable: true,
                    expanded: false,
                    content: [oText]
                });
                // Add panel to VBox
                oVBox.addItem(oPanel);
            });



        },




        /**
         * Sets up responsive behavior for the scroll container
         */
        _setupResponsiveScrollContainer: function () {
            var oScroll = this.byId("idApplicationsScrollContainer");
            var oGrid = this.byId("idApplicationsTileGrid");

            if (oScroll && oGrid) {
                // With 8 hard-coded tiles → exactly 2 rows, no scroll needed initially
                oScroll.setHeight("auto");

                // Check if we need scrolling based on tile count
                var iTileCount = oGrid.getContent().length;
                if (iTileCount > 8) {
                    // Fix height to 2 rows so scroll kicks in for additional tiles
                    oScroll.setHeight("20rem");
                }
            }
        },

        /**
         * Attach resize handler for responsive adjustments
         */
        _attachResizeHandler: function () {
            // Use SAP UI5's built-in resize handler
            sap.ui.core.ResizeHandler.register(this.getView(), this._onResize.bind(this));
        },

        /**
         * Handle window resize events for responsive behavior
         */
        _onResize: function () {
            // Refresh announcement styles on resize to ensure proper display
            setTimeout(() => {
                this._updateAnnouncementStyles();
            }, 100);
        },

        _setDateAndTemp: function (oBannerModel) {
            // Format current date
            var oDate = new Date();
            var options = { weekday: "short", month: "short", day: "numeric" };
            var sDateStr = oDate.toLocaleDateString("en-US", options);

            var sUrl = "https://api.openweathermap.org/data/2.5/weather?q=Delhi&units=metric&appid=581e55b2ebf99e5d813b59b77e2ea49b";

            jQuery.ajax({
                url: sUrl,
                method: "GET",
                success: function (oData) {
                    var sTemp = Math.round(oData.main.temp) + "°C";
                    oBannerModel.setProperty("/dateTemp", sDateStr + " | " + sTemp);
                },
                error: function () {
                    // fallback if API fails
                    oBannerModel.setProperty("/dateTemp", sDateStr + " | 32°C");
                }
            });
        },

        _initializeKnowledgeArticles: function () {
            // Initialize with empty model first
            var oArticlesModel = new JSONModel({ values: [] });
            this.getView().setModel(oArticlesModel, "articlesModel");

            // Then load the hard-coded articles
            this._loadKnowledgeArticles();
        },

        _loadKnowledgeArticles: function () {
            var oArticlesModel = this.getView().getModel("articlesModel");

            var aArticles = [
                {
                    articleName: "How to Request Access using the New Vital Self Service Access Tool",
                    url: "https://jnjfinance.service-now.com/fsp?id=kb_article&sys_id=8cdb131ddb4c12106853676ed396193a",
                    views: "1906"
                },
                {
                    articleName: "Error While Loading AFO Reports? Try This!",
                    url: "https://jnjfinance.service-now.com/fsp?id=kb_article&sys_id=c12667b4db509e146853676ed39619dd",
                    views: "1599"
                },
                {
                    articleName: "System Enhancement Playbook",
                    url: "https://jnjfinance.service-now.com/fsp?id=kb_article&sys_id=system123",
                    views: "924"
                },
                {
                    articleName: "Virtual Report Access Removal",
                    url: "https://jnjfinance.service-now.com/fsp?id=kb_article&sys_id=b68a522b1b0fce5d99c9c9192a4bcbb1",
                    views: "640"
                },
                {
                    articleName: "SOX / Accuracy Controls Guidance for Enhancements and Deferred Defects in Vital Get Help",
                    url: "https://jnjfinance.service-now.com/fsp?id=kb_article&sys_id=4aef47c11b54961499c9c9192a4bcb58",
                    views: "516"
                }
            ];

            // Add sequential numbers
            aArticles.forEach(function (article, index) {
                article.number = (index + 1) + ".";
            });

            // Set the data
            oArticlesModel.setData({ values: aArticles });
            oArticlesModel.refresh(true);

            console.log("Articles model updated with numbered data");
        },

        /**
         * Creates tiles programmatically and adds them to the Grid
         */
        _createTiles: function () {
            var oGrid = this.byId("idApplicationsTileGrid");
            var oTilesModel = this.getView().getModel("tilesModel");
            var aTiles = oTilesModel.getProperty("/tiles");

            console.log(aTiles);

            // Clear existing tiles
            oGrid.removeAllContent();

            aTiles.forEach(function (tileData) {
                // Create ImageContent
                var oImageContent = new ImageContent({
                    src: tileData.icon
                });

                // Create TileContent
                var oTileContent = new TileContent({
                    content: oImageContent
                });

                // Create GenericTile
                var oTile = new GenericTile({
                    header: tileData.title,
                    subheader: tileData.subtitle,
                    tileContent: [oTileContent],
                    press: this.onTilePress.bind(this)
                });

                // Add custom data to identify the tile
                oTile.data("tileData", tileData);

                // Set responsive layout data
                // L3 = 4 tiles per row on large screens
                // M6 = 2 tiles per row on medium screens  
                // S12 = 1 tile per row on small screens
                oTile.setLayoutData(new GridData({
                    span: "L3 M6 S12"
                }));

                // Add standard SAP UI5 margin classes for proper spacing
                oTile.addStyleClass("sapUiTinyMargin");

                // Add tile to grid
                oGrid.addContent(oTile);
            }.bind(this));

            // Update scroll container behavior after tiles are created
            this._setupResponsiveScrollContainer();
        },

        /**
         * Handle tile press event with iframe loading and fallback to new tab
         * @param {sap.ui.base.Event} oEvent - The tile press event
         */
        // onTilePress: function(oEvent) {
        //     var oContext = oEvent.getSource().getBindingContext("tilesModel");
        //     if (!oContext) {
        //         MessageToast.show("No data found for this tile");
        //         return;
        //     }

        //     var oData = oContext.getObject();
        //     var sUrl = oData.url;
        //     var sEmbedMode = oData.embedMode;
        //     var sTitle = oData.title || "Application";

        //     if (!sUrl) {
        //         MessageToast.show("Application URL not found");
        //         return;
        //     }

        //     // Check if embed mode is explicitly set to "newtab"
        //     if (sEmbedMode === "newtab") {
        //         this._openInNewTab(sUrl, sTitle);
        //         return;
        //     }

        //     // Try to load in iframe, with fallback to new tab
        //     this._loadInIframe(sUrl, sTitle);
        // },
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
            var oTile = oEvent.getSource();
            var oData = oTile.data("tileData"); // <-- fetch from custom data

            if (!oData) {
                MessageToast.show("No data found for this tile");
                return;
            }

            var sUrl = oData.url;
            var sEmbedMode = oData.embedMode;
            var sTitle = oData.title || "Application";

            if (!sUrl) {
                MessageToast.show("Application URL not found");
                return;
            }

            if (sEmbedMode === "newtab") {
                this._openInNewTab(sUrl, sTitle);
                return;
            }

            this._loadInIframe(sUrl, sTitle);
        },

        /**
         * Load application in iframe with fallback mechanism
         * @param {string} sUrl - Application URL
         * @param {string} sTitle - Application title
         */
        // _loadInIframe: function (sUrl, sTitle) {
        //     // Hide tiles and show iframe container
        //     this.byId("idApplicationsTileContainerVBx").setVisible(false);

        //     var oVBox = this.byId("idIFrameContainerVBx");
        //     oVBox.removeAllItems();
        //     oVBox.setVisible(true);

        //     // Show loading indicator
        //     this._showLoadingMessage("Loading " + sTitle + "...");

        //     // Clear any existing timeout
        //     if (this._iframeLoadTimeout) {
        //         clearTimeout(this._iframeLoadTimeout);
        //     }

        //     var that = this;
        //     var bLoaded = false;
        //     var sIframeId = "idEmbeddediFrame_" + Date.now(); // Unique ID

        //     // Create iframe with enhanced attributes
        //     var sIframeContent = "<div style='position:relative;width:100%;height:90vh;'>" +
        //         "<iframe id='" + sIframeId + "' " +
        //         "src='" + sUrl + "' " +
        //         "style='width:100%;height:100%;border:none;' " +
        //         "sandbox='allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox' " +
        //         "loading='eager'>" +
        //         "<p>Your browser does not support iframes.</p>" +
        //         "</iframe>" +
        //         "<div id='loadingOverlay_" + sIframeId + "' style='position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;font-size:16px;'>Loading...</div>" +
        //         "</div>";

        //     var oIframe = new sap.ui.core.HTML({
        //         content: sIframeContent
        //     });
        //     oVBox.addItem(oIframe);

        //     // Set timeout for fallback (10 seconds)
        //     this._iframeLoadTimeout = setTimeout(function () {
        //         if (!bLoaded) {
        //             console.log("❌ Iframe timeout for: " + sUrl);
        //             MessageToast.show("Application failed to load. Opening in new tab...");
        //             that._openInNewTab(sUrl, sTitle);
        //         }
        //     }, 10000);

        //     // Wait for DOM to be ready, then attach event handlers
        //     setTimeout(function () {
        //         var iframe = document.getElementById(sIframeId);
        //         var loadingOverlay = document.getElementById('loadingOverlay_' + sIframeId);

        //         if (!iframe) {
        //             console.error("Iframe not found in DOM");
        //             that._openInNewTab(sUrl, sTitle);
        //             return;
        //         }

        //         // Success handler
        //         var fnOnLoad = function () {
        //             if (bLoaded) return; // Prevent multiple calls
        //             bLoaded = true;
        //             clearTimeout(that._iframeLoadTimeout);

        //             // Hide loading overlay
        //             if (loadingOverlay) {
        //                 loadingOverlay.style.display = 'none';
        //             }

        //             console.log("✅ Iframe loaded successfully: " + sUrl);
        //             MessageToast.show(sTitle + " loaded successfully");

        //             // Additional verification after a short delay
        //             setTimeout(function () {
        //                 that._verifyIframeContent(iframe, sUrl, sTitle);
        //             }, 2000);
        //         };

        //         // Error handler
        //         var fnOnError = function () {
        //             if (bLoaded) return; // Prevent multiple calls
        //             bLoaded = true;
        //             clearTimeout(that._iframeLoadTimeout);

        //             console.log("❌ Iframe error for: " + sUrl);
        //             MessageToast.show("Failed to load " + sTitle + ". Opening in new tab...");
        //             that._openInNewTab(sUrl, sTitle);
        //         };

        //         // Attach event handlers
        //         iframe.onload = fnOnLoad;
        //         iframe.onerror = fnOnError;

        //         // Additional error detection for blocked content
        //         iframe.addEventListener('load', function () {
        //             // Check if iframe was redirected to an error page
        //             setTimeout(function () {
        //                 try {
        //                     var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        //                     if (iframeDoc && iframeDoc.title &&
        //                         (iframeDoc.title.toLowerCase().includes('error') ||
        //                             iframeDoc.title.toLowerCase().includes('blocked'))) {
        //                         throw new Error('Error page detected');
        //                     }
        //                 } catch (e) {
        //                     // Cross-origin restrictions - this is expected for external sites
        //                     // Don't treat this as an error
        //                     console.log("Cross-origin iframe - cannot verify content");
        //                 }
        //             }, 1000);
        //         });

        //     }, 100);
        // },

        _loadInIframe: function (sUrl, sTitle) {
            // Reference the HTML control for the iframe
            var oHtml = this.byId("idApplicationFrameHtml");

            if (!oHtml) {
                console.error("❌ idApplicationFrameHtml not found in the view");
                this._openInNewTab(sUrl, sTitle);
                return;
            }

            // Show loading indicator
            this._showLoadingMessage("Loading " + sTitle + "...");

            // Clear any existing timeout
            if (this._iframeLoadTimeout) {
                clearTimeout(this._iframeLoadTimeout);
            }

            var that = this;
            var bLoaded = false;
            var sIframeId = "idEmbeddediFrame_" + Date.now();

            // Create iframe + overlay
            var sIframeContent =
                "<div style='position:relative;width:100%;height:90vh;'>" +
                "<iframe id='" + sIframeId + "' " +
                "src='" + sUrl + "' " +
                "style='width:100%;height:100%;border:none;' " +
                "sandbox='allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox' " +
                "loading='eager'>" +
                "<p>Your browser does not support iframes.</p>" +
                "</iframe>" +
                "<div id='loadingOverlay_" + sIframeId + "' " +
                "style='position:absolute;top:0;left:0;width:100%;height:100%;" +
                "background:rgba(255,255,255,0.9);display:flex;" +
                "align-items:center;justify-content:center;font-size:16px;'>Loading...</div>" +
                "</div>";

            // Inject into core:HTML control
            oHtml.setContent(sIframeContent);

            // Timeout fallback (only for iframe mode)
            this._iframeLoadTimeout = setTimeout(function () {
                if (!bLoaded) {
                    console.log("❌ Iframe timeout for: " + sUrl);
                    MessageToast.show("This site cannot be embedded. Opening in new tab...");
                    that._openInNewTab(sUrl, sTitle);
                }
            }, 10000);

            // Wait for DOM injection
            setTimeout(function () {
                var iframe = document.getElementById(sIframeId);
                var loadingOverlay = document.getElementById("loadingOverlay_" + sIframeId);

                if (!iframe) {
                    console.error("❌ Iframe not found in DOM after injection");
                    that._openInNewTab(sUrl, sTitle);
                    return;
                }

                // Success handler
                iframe.onload = function () {
                    if (bLoaded) return;
                    bLoaded = true;
                    clearTimeout(that._iframeLoadTimeout);

                    if (loadingOverlay) {
                        loadingOverlay.style.display = "none";
                    }

                    console.log("✅ Iframe loaded successfully: " + sUrl);
                    MessageToast.show(sTitle + " loaded successfully");

                    // Verify same-origin if possible
                    // setTimeout(function () {
                    //     that._verifyIframeContent(iframe, sUrl, sTitle);
                    // }, 2000);
                };

                // Error handler
                iframe.onerror = function () {
                    if (bLoaded) return;
                    bLoaded = true;
                    clearTimeout(that._iframeLoadTimeout);

                    console.log("❌ Iframe error for: " + sUrl);
                    MessageToast.show("Failed to load " + sTitle + ". Opening in new tab...");
                    that._openInNewTab(sUrl, sTitle);
                };
            }, 200);
        },



        /**
         * Open application in new tab
         * @param {string} sUrl - Application URL
         * @param {string} sTitle - Application title
         */
        _openInNewTab: function (sUrl, sTitle) {
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
        _showLoadingMessage: function (sMessage) {
            MessageToast.show(sMessage);
        },

        /**
         * Logo press handler - return to tiles view
         */
        onLogoPress: function () {
            this.byId("idApplicationsTileGrid").setVisible(true);

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
         * Enhanced announcement styles update with responsive considerations
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

                // Update line styles
                oLineVBox.removeStyleClass("lineBlue");
                oLineVBox.removeStyleClass("lineLightGray");
                oLineVBox.addStyleClass(data.read ? "lineLightGray" : "lineBlue");

                // Recursive style application for nested elements
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
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteAnnouncementDetails");
        },

        onViewAllArticles: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteKnowledgeArticleDetails");
        },

    });
})