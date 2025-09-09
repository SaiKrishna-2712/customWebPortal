sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("com.inctue.customwebportal.controller.FAQ", {
        onInit: function () {
            // Sample FAQ data
            var oData = {
                faqs: [
                    { question: "What is DHO?" },
                    { question: "What does Virtual vs. Persistent Model mean?" },
                    { question: "How do I convert to Constant Currency or As Reported Currency?" },
                    { question: "What is changing relating to data with DHO optimization?" }
                ]
            };
            this.getView().setModel(new JSONModel(oData), "faqModel");

            // ✅ Move delegate to the VIEW, not the HTML control
            var that = this;
            this.getView().addEventDelegate({
                onAfterRendering: function () {
                    var oBtn = document.getElementById("faqBtn");
                    if (oBtn) {
                        oBtn.onclick = function () {
                            that.onOpenFAQ();
                        };
                        that._makeDraggable(oBtn);
                    }
                }
            });
        },

        onOpenFAQ: function () {
            var oDialog = this.byId("faqDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseDialog: function () {
            var oDialog = this.byId("faqDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        _makeDraggable: function (el) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            el.onmousedown = dragMouseDown;

            function dragMouseDown(e) {
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                el.style.top = (el.offsetTop - pos2) + "px";
                el.style.left = (el.offsetLeft - pos1) + "px";
                el.style.bottom = "auto"; // prevent snapping back
                el.style.right = "auto";
            }

            function closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    });
});
