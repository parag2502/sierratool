function CheckColumnDuplicatesDialog() {
    this._createDialog();
}

CheckColumnDuplicatesDialog.prototype._createDialog = function() {
    var self = this;
    var dialog = $(DOM.loadHTML("core", "scripts/dialogs/check-column-duplicates-dialog.html"));
    this._elmts = DOM.bind(dialog);
    
    this._elmts.cancelButton.click(function() { self._dismiss(); });
    this._elmts.okButton.click(function() { self._commit(); });
    
    this._elmts.dialogHeader.html($.i18n('core-dialogs/add-new-column-check-duplicates'));
    this._elmts.or_views_newCol.html($.i18n('core-views/new-col-name'));
    this._elmts.or_dialog_dragCol.html($.i18n('core-dialogs/select-column-duplicates'));
    this._elmts.or_dialog_dropCol.html($.i18n('core-dialogs/drop-column-duplicates'));
    this._elmts.okButton.html($.i18n('core-buttons/ok'));
    this._elmts.cancelButton.html($.i18n('core-buttons/cancel'));
    
    this._level = DialogSystem.showDialog(dialog);
    
    for (var i = 0; i < theProject.columnModel.columns.length; i++) {
        var column = theProject.columnModel.columns[i];
        var name = column.name;
        
        console.log("==========>"+name);
        
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
    var columnNames = this._elmts.columnContainer.find('div').map(function() { return this.getAttribute("column"); }).get();
    
    console.log("==========>"+columnNames);
    /*Refine.postCoreProcess(
        "reorder-columns",
        null,
        { "columnNames" : JSON.stringify(columnNames) }, 
        { modelsChanged: true },
        { includeEngine: false }
    );*/
    
    this._dismiss();
};
