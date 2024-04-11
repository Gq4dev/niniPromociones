sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Filter, FilterOperator, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("promociones.controller.View1", {
      onInit: function () {
        var oTable = this.getView().byId("Table");
        oTable.attachRowSelectionChange(this.onRowSelectionChange, this);
      },
      onRowSelectionChange: function (oEvent) {
        var oSelectedItem = oEvent.getParameter("rowContext");
        var oSelectedData = oSelectedItem.getObject();
        this.navigateToDetail(oSelectedData);
      },
      navigateToDetail: function (oSelectedData) {
        var oModel = this.getOwnerComponent().getModel("TempDataModel");
        oModel.setData(oSelectedData);

        console.log(oModel.getData());
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteDetail");
      },
      onFilters: function () {
        var oDataFilter = [];

        var sOferta = this.byId("idOfertaInput").getValue().padStart(36, 0);
        var sMaterial = this.byId("materialInput").getValue().padStart(60, 0);

        if (this.byId("idOfertaInput").getValue().length > 0) {
          oDataFilter.push(new Filter("ExtOfrId", FilterOperator.EQ, sOferta));
        }

        if (this.byId("materialInput").getValue().length > 0) {
          oDataFilter.push(new Filter("Matnr", FilterOperator.EQ, sMaterial));
        }
        var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: "YYYY-MM-dd",
        });
        var fromDate = dateFormat.format(
          this.getView().byId("fechaPicker").getDateValue()
        );
        var toDate = dateFormat.format(
          this.getView().byId("fechaPicker").getSecondDateValue()
        );

        if (fromDate && toDate) {
          oDataFilter.push(
            new Filter("Fechainiciopromo", FilterOperator.GE, fromDate),
            new Filter("Fechafinpromo", FilterOperator.LE, toDate)
          );
        }

        return new Array(new Filter({ filters: oDataFilter, and: true }));
      },

      createColumns: function (oTempModel, oTable) {
        var aColumns = [];

        var oResourceBundle = this.getView()
          .getModel("i18n")
          .getResourceBundle();

        Object.keys(oTempModel.getData()[0])
          .slice(1)
          .forEach(function (sProperty) {
            aColumns.push(
              new sap.ui.table.Column({
                label: new sap.m.Label({
                  text: oResourceBundle.getText(sProperty),
                }),
                template: new sap.m.Text({ text: "{" + sProperty + "}" }),
                width: "120px",
                sortProperty: sProperty,
                filterProperty: sProperty,
              })
            );
          });

        oTable.removeAllColumns();
        aColumns.forEach(function (oColumn) {
          oTable.addColumn(oColumn);
        });
      },
      onSearch: function () {
        var oModel = this.getOwnerComponent().getModel();
        var oTable = this.byId("Table");
        var oPage = this.getView().byId("page");

        oTable.setBusy(true);
        oTable.removeAllColumns();

        let queryFilter = this.onFilters();

        oModel.read("/promocionesSet", {
          filters: queryFilter,
          success: function (data) {
            if (data.results.length > 0) {
              var oTempModel = new sap.ui.model.json.JSONModel(data.results);

              this.createColumns(oTempModel, oTable);

              oTable.setModel(oTempModel);
              oTable.bindRows("/");

              oTable.setBusy(false);
              oPage.addContent(oTable);
            } else {
              oTable.setBusy(false);
              MessageToast.show("No hay datos para mostrar");
            }
          }.bind(this),
          error: function (error) {
            console.log(error);
            MessageToast.show("Hubo un error al realizar la busqueda");
            oTable.setBusy(false);
          },
        });
      },
    });
  }
);
