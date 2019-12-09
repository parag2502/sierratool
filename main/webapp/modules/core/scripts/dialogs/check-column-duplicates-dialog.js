function CheckColumnDuplicatesDialog(dataTableView) {
    this._createDialog();
    this._dataTableView = dataTableView;
}

CheckColumnDuplicatesDialog.prototype._createDialog = function() {
    var self = this;
    var dialog = $(DOM.loadHTML("core", "scripts/dialogs/check-column-duplicates-dialog.html"));
    this._elmts = DOM.bind(dialog);
    
    this._elmts.cancelButton.click(function() { self._dismiss(); });
    this._elmts.okButton.click(function() { self._commit(); });
    
    this._elmts.dialogHeader.html($.i18n('core-dialogs/add-new-column-check-duplicates'));
    //this._elmts.or_views_newCol.html($.i18n('core-views/new-col-name'));
    this._elmts.or_dialog_dragCol.html($.i18n('core-dialogs/select-column-duplicates'));
    //this._elmts.or_dialog_dropCol.html($.i18n('core-dialogs/drop-column-duplicates'));
    this._elmts.okButton.html($.i18n('core-buttons/ok'));
    this._elmts.cancelButton.html($.i18n('core-buttons/cancel'));
    
    this._level = DialogSystem.showDialog(dialog);
    
    for (var i = 0; i < theProject.columnModel.columns.length; i++) {
        var column = theProject.columnModel.columns[i];
        var name = column.name;
        
        $('<div>')
            .addClass("column-reordering-dialog-column")
            .text(name)
            .attr("column", name)
            .appendTo(this._elmts.columnContainer);
    }
    
    dialog.find('.column-reordering-dialog-column-container')
        .sortable({
            connectWith: '.column-reordering-dialog-column-container'
        })
        .disableSelection();
};

CheckColumnDuplicatesDialog.prototype._dismiss = function() {
    DialogSystem.dismissUntil(this._level - 1);
};

CheckColumnDuplicatesDialog.prototype._commit = function() {
	var self = this;
	var columnName = "Status";
    if(Refine.columnNameToColumnIndex(columnName) != -1){
    	Refine.postCoreProcess(
  		      "remove-column", 
  		      {
  		        columnName: columnName
  		      },
  		      null,
  		      { modelsChanged: true },
  		      {}
  		    );
    }
    
    var columnNames = this._elmts.columnContainer.find('div').map(function() { return this.getAttribute("column"); }).get();
    var selectedColumnNames = this._elmts.trashContainer.find('div').map(function() { return this.getAttribute("column"); }).get();
    
    var baseColName = columnNames.toString().split(',');
    var selColArr = selectedColumnNames.toString().split(',');
    var columnIndex = Refine.columnNameToColumnIndex(baseColName[0]);
    
    var colName = sessionStorage.getItem("statusColName");
    if(colName == null){
    	sessionStorage.setItem("statusColName", columnName);
    }
    
    if (!columnName.length) {
      alert($.i18n('core-views/warning-col-name'));
      return;
    }
    
    var expressionQuery = "grel:";
    for(var i=0; i<selColArr.length; i++){
    	if(i==0){
    		expressionQuery = expressionQuery + "cells['"+selColArr[0]+"'].value";
    	} else {
    		expressionQuery = expressionQuery + "+ '-' +" + "cells['"+selColArr[i]+"'].value";
    	}
    }
    
    var baseCol = baseColName[0];
    if(baseCol == "Status"){
    	baseCol = baseColName[1];
    }
    
    Refine.postCoreProcess(
      "add-column", 
      {
        baseColumnName: baseCol,  
        newColumnName: columnName, 
        columnInsertIndex: columnIndex,
        onError: "Error"
      },
      { expression: expressionQuery.toString() },
      { modelsChanged: true },
      {
        onDone: function(o) {
        	var criterion2 = {
                    column: columnName,
                    valueType: "string",
                    reverse: false,
                    blankPosition:2,
                    errorPosition:1,
                    caseSensitive:false
                };
            self._dataTableView._addSortingCriterionColDuplicate(criterion2, columnName);
        }
      }
    );
    
    this._dismiss();
};
