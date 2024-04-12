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
        this._mFilters = {
          "Liberados": [new Filter("Estadopmr", FilterOperator.EQ, "Liberados")],
          "Enproceso": [new Filter("Estadopmr", FilterOperator.EQ,"En Proceso")],
          "Fallido": [new Filter("Estadopmr", FilterOperator.EQ, "")],
      };
      },
      onLiveChange: function (oEvent) {
        var oInput = oEvent.getSource();
        var sNewValue = oInput.getValue().toUpperCase();
        oInput.setValue(sNewValue);
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

        if (this.byId("centroInput").getValue().length > 0) {
          oDataFilter.push(
            new Filter(
              "Werks",
              FilterOperator.EQ,
              this.byId("centroInput").getValue()
            )
          );
        }

        if (this.byId("grupoInput").getValue().length > 0) {
          oDataFilter.push(
            new Filter(
              "Wekgr",
              FilterOperator.EQ,
              this.byId("grupoInput").getValue().toString()
            )
          );
        }
        if (this.byId("statusInput").getValue().length > 0) {
          oDataFilter.push(
            new Filter(
              "Estadopmr",
              FilterOperator.EQ,
              this.byId("statusInput").getValue().toString()
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
      onCreateIconFilters: function (data) {
        var statusFilterCount = {};
        var statusCount = new JSONModel();
        data.forEach((item) => {
          if (statusFilterCount.hasOwnProperty((item.Estadopmr).replace(/\s/g, ""))) {
            statusFilterCount[item.Estadopmr.replace(/\s/g, "")]++;
          } else {
            // Si no está, inicializamos su contador en 1
            statusFilterCount[item.Estadopmr.replace(/\s/g, "")] = 1;
          }
        });
        statusCount.setData(statusFilterCount);

        console.log(statusCount.getData());
        this.getView().setModel(statusCount, "statusCount");
        console.log(statusFilterCount);
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
        var panel = this.byId("tabFilter");
        var filterTab = this.byId("idIconTabBar");
        filterTab.setVisible(false);
        panel.setCount();

        oTable.setBusy(true);
        oTable.removeAllColumns();

        let queryFilter = this.onFilters();

        oModel.read("/promocionesSet", {
          filters: queryFilter,
          success: function (data) {
            if (data.results.length > 0) {
              var oTempModel = new sap.ui.model.json.JSONModel(data.results);
              this.onCreateIconFilters(data.results);
              this.createColumns(oTempModel, oTable);

              oTable.setModel(oTempModel);
              oTable.bindRows("/");

              panel.setCount("( " + data.results.length + " )");

              oTable.setBusy(false);
              filterTab.setVisible(true);
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
      onFilterSelect: function(oEvent) {
        // Obtener el binding de las filas de la tabla
        var oTable = this.getView().byId("Table"),
            oBinding = oTable.getBinding("rows"),
            sKey = oEvent.getParameter("selectedKey");
    
        // Filtrar las filas de la tabla según la clave seleccionada
        oBinding.filter(this._mFilters[sKey]);
    }
    
    });
  }
);
