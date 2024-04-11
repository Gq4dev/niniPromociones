sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("promociones.controller.Detail", {
    onInit: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

      var oModel = this.getOwnerComponent().getModel("TempDataModel");

      console.log("Modelo", oModel.getData());
      // oRouter
      //   .getRout,e("RouteDetail")
      //   .attachPatternMatched(this.onRouteMatched, this);
      // },
      // onRouteMatched: function (oEvent) {
      //   var oParameters = oEvent.getParameters();
      //   var oQuery = oParameters.arguments;
      //   var sSelectedData = oQuery.selectedData;
      //   var oSelectedData = JSON.parse(sSelectedData);
      //   this.getView().bindElement({
      //     path: "/",
      //     model: new sap.ui.model.json.JSONModel(oSelectedData),
      //   });
    },
  });
});
