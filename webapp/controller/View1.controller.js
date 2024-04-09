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
      onInit: function () {},
      onFilters: function () {
        var oDataFilter = [];
        var sPaddedValue = this.byId("idOfertaInput")
          .getValue()
          .padStart(36, 0);

        if (this.byId("idOfertaInput").getValue().length > 0) {
          oDataFilter.push(
            new Filter("ExtOfrId", FilterOperator.EQ, sPaddedValue)
          );
        }

        if (this.byId("materialInput").getValue().length > 0) {
          oDataFilter.push(
            new Filter(
              "Matnr",
              FilterOperator.EQ,
              this.byId("materialInput").getValue()
            )
          );
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
        var aProperties = Object.keys(oTempModel.getData()[0]);
        aProperties.slice(1).forEach(function (sProperty) {
          var oColumn = new sap.m.Column({
            width: "120px",
            header: new sap.m.Label({ text: sProperty }),
          });
          oTable.addColumn(oColumn);
        });
      },
      onSearch: function () {
        var oModel = this.getOwnerComponent().getModel();

        var oTable = this.byId("Table");
        var oPage = this.getView().byId("page");
       // oTable.removeAllColumns();
       // oPage.removeContent(oTable);

        let queryFilter = this.onFilters();

        oModel.read("/promocionesSet", {
          filters: queryFilter,
          success: function (data) {
            var oTempModel = new sap.ui.model.json.JSONModel(data.results);

            this.createColumns(oTempModel, oTable);

            oTable.setModel(oTempModel);
            oTable.bindItems(
              "/",
              new sap.m.ColumnListItem({
                cells: Object.keys(data.results[0])
                  .slice(1)
                  .map(function (sProperty) {
                    return new sap.m.Text({ text: "{" + sProperty + "}" });
                  }),
              })
            );

            oPage.addContent(oTable);
          }.bind(this),
          error: function (error) {
            console.log(error);
            MessageToast.show("No Hay data");
          },
        });
      },
    });
  }
);
