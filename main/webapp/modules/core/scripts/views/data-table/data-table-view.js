function DataTableView(div) {
  this._div = div;

  this._pageSize = 10;
  this._showRecon = true;
  this._collapsedColumnNames = {};
  this._sorting = { criteria: [] };
  this._columnHeaderUIs = [];
  this._shownulls = false;
  
  this._showRows(0);
}

DataTableView._extenders = [];
var duplicate = [];
var incomplete = [];
var statusList = [];

/*
  To extend, do something like this

  DataTableView.extendMenu(function(dataTableView, menu) {
      ...
    MenuSystem.appendTo(menu, [ "core/view" ], {
      "label": "Test",
      "click": function() {
          alert("Test");
      } 
    });
  });
*/
DataTableView.extendMenu = function(extender) {
  DataTableView._extenders.push(extender);
};

DataTableView.prototype.getSorting = function() {
  return this._sorting;
};

DataTableView.prototype.resize = function() {
  this._adjustDataTables();
  
  var topHeight =
    this._div.find(".viewpanel-header").outerHeight(true) +
    this._div.find(".data-header-table-container").outerHeight(true);
  var tableContainerIntendedHeight = this._div.innerHeight() - topHeight;
  
  var tableContainer = this._div.find(".data-table-container").css("display", "block");
  var tableContainerVPadding = tableContainer.outerHeight(true) - tableContainer.height();
  tableContainer.height((tableContainerIntendedHeight - tableContainerVPadding) + "px");
};

DataTableView.prototype.update = function(onDone) {
  this._showRows(0, onDone);
};

DataTableView.prototype.render = function() {
  var self = this;

  var oldTableDiv = this._div.find(".data-table-container");
  var scrollLeft = (oldTableDiv.length > 0) ? oldTableDiv[0].scrollLeft : 0;

  var html = $(
    '<div class="viewpanel-header">' +
      '<div class="viewpanel-rowrecord" bind="rowRecordControls">'+$.i18n('core-views/show-as')+': ' +
        '<span bind="modeSelectors"></span>' + 
      '</div>' +
      '<div class="viewpanel-pagesize" bind="pageSizeControls"></div>' +
      '<div class="viewpanel-sorting" bind="sortingControls"></div>' +
      '<div class="viewpanel-paging" bind="pagingControls"></div>' +
    '</div>' +
    '<div bind="dataHeaderTableContainer" class="data-header-table-container">' +
      '<table bind="headerTable" class="data-header-table"></table>' +
    '</div>' +
    '<div bind="dataTableContainer" class="data-table-container">' +
      '<table bind="table" class="data-table"></table>' +
    '</div>'
  );
  var elmts = DOM.bind(html);

  ui.summaryBar.updateResultCount();

  var renderBrowsingModeLink = function(label, value) {
    var a = $('<a href="javascript:{}"></a>')
    .addClass("viewPanel-browsingModes-mode")
    .text(label)
    .appendTo(elmts.modeSelectors);

    if (value == ui.browsingEngine.getMode()) {
      a.addClass("selected");
    } else {
      a.addClass("action").click(function(evt) {
        ui.browsingEngine.setMode(value);
      });
    }
  };
  renderBrowsingModeLink($.i18n('core-views/rows'), "row-based");
  renderBrowsingModeLink($.i18n('core-views/records'), "record-based");

  this._renderPagingControls(elmts.pageSizeControls, elmts.pagingControls);

  if (this._sorting.criteria.length > 0) {
    this._renderSortingControls(elmts.sortingControls);
  }

  this._renderDataTables(elmts.table[0], elmts.headerTable[0]);
  
  this._div.empty().append(html);

  // show/hide null values in cells
  $(".data-table-null").toggle(self._shownulls);

  this.resize();
  
  elmts.dataTableContainer[0].scrollLeft = scrollLeft;
};

DataTableView.prototype._renderSortingControls = function(sortingControls) {
  var self = this;

  $('<a href="javascript:{}"></a>')
  .addClass("action")
  .text("Sort ")
  .append($('<img>').attr("src", "../images/down-arrow.png"))
  .appendTo(sortingControls)
  .click(function() {
    self._createSortingMenu(this);
  });
};

DataTableView.prototype._renderPagingControls = function(pageSizeControls, pagingControls) {
  var self = this;

  var from = (theProject.rowModel.start + 1);
  var to = Math.min(theProject.rowModel.filtered, theProject.rowModel.start + theProject.rowModel.limit);

  var firstPage = $('<a href="javascript:{}">&laquo; '+$.i18n('core-views/first')+'</a>').appendTo(pagingControls);
  var previousPage = $('<a href="javascript:{}">&lsaquo; '+$.i18n('core-views/previous')+'</a>').appendTo(pagingControls);
  if (theProject.rowModel.start > 0) {
    firstPage.addClass("action").click(function(evt) { self._onClickFirstPage(this, evt); });
    previousPage.addClass("action").click(function(evt) { self._onClickPreviousPage(this, evt); });
  } else {
    firstPage.addClass("inaction");
    previousPage.addClass("inaction");
  }

  $('<span>').addClass("viewpanel-pagingcount").html(" " + from + " - " + to + " ").appendTo(pagingControls);

  var nextPage = $('<a href="javascript:{}">'+$.i18n('core-views/next')+' &rsaquo;</a>').appendTo(pagingControls);
  var lastPage = $('<a href="javascript:{}">'+$.i18n('core-views/last')+' &raquo;</a>').appendTo(pagingControls);
  if (theProject.rowModel.start + theProject.rowModel.limit < theProject.rowModel.filtered) {
    nextPage.addClass("action").click(function(evt) { self._onClickNextPage(this, evt); });
    lastPage.addClass("action").click(function(evt) { self._onClickLastPage(this, evt); });
  } else {
    nextPage.addClass("inaction");
    lastPage.addClass("inaction");
  }

  $('<span>'+$.i18n('core-views/show')+': </span>').appendTo(pageSizeControls);
  var sizes = [ 5, 10, 25, 50 ];
  var renderPageSize = function(index) {
    var pageSize = sizes[index];
    var a = $('<a href="javascript:{}"></a>')
    .addClass("viewPanel-pagingControls-page")
    .appendTo(pageSizeControls);
    if (pageSize == self._pageSize) {
      a.text(pageSize).addClass("selected");
    } else {
      a.text(pageSize).addClass("action").click(function(evt) {
        self._pageSize = pageSize;
        self.update();
      });
    }
  };
  for (var i = 0; i < sizes.length; i++) {
    renderPageSize(i);
  }

  $('<span>')
  .text(theProject.rowModel.mode == "record-based" ? ' '+$.i18n('core-views/records') : ' '+$.i18n('core-views/rows'))
  .appendTo(pageSizeControls);
};

DataTableView.prototype._renderDataTables = function(table, headerTable) {
  var self = this;

  var columns = theProject.columnModel.columns;
  var columnGroups = theProject.columnModel.columnGroups;

  /*------------------------------------------------------------
   *  Column Group Headers
   *------------------------------------------------------------
   */

  var renderColumnKeys = function(keys) {
    if (keys.length > 0) {
      var tr = headerTable.insertRow(headerTable.rows.length);
      $(tr.insertCell(0)).attr('colspan', '3'); // star, flag, row index

      for (var c = 0; c < columns.length; c++) {
        var column = columns[c];
        var td = tr.insertCell(tr.cells.length);
        if (column.name in self._collapsedColumnNames) {
          $(td).html('&nbsp;');
        } else {
          for (var k = 0; k < keys.length; k++) {
            if (c == keys[k]) {
              $('<img />').attr("src", "../images/down-arrow.png").appendTo(td);
              break;
            }
          }
        }
      }
    }
  };

  var renderColumnGroups = function(groups, keys) {
    var nextLayer = [];

    if (groups.length > 0) {
      var tr = headerTable.insertRow(headerTable.rows.length);
      $(tr.insertCell(0)).attr('colspan', '3'); // star, flag, row index

      for (var c = 0; c < columns.length; c++) {
        var foundGroup = false;
        var columnGroup;

        for (var g = 0; g < groups.length; g++) {
          columnGroup = groups[g];
          if (columnGroup.startColumnIndex == c) {
            foundGroup = true;
            break;
          }
        }

        var td = tr.insertCell(tr.cells.length);
        if (foundGroup) {
          td.setAttribute("colspan", columnGroup.columnSpan);
          td.style.background = "#FF6A00";

          if (columnGroup.keyColumnIndex >= 0) {
            keys.push(columnGroup.keyColumnIndex);
          }

          c += (columnGroup.columnSpan - 1);

          if ("subgroups" in columnGroup) {
            nextLayer = nextLayer.concat(columnGroup.subgroups);
          }
        }
      }
    }

    renderColumnKeys(keys);

    if (nextLayer.length > 0) {
      renderColumnGroups(nextLayer, []);
    }
  };

  if (columnGroups.length > 0) {
    renderColumnGroups(
        columnGroups, 
        [ theProject.columnModel.keyCellIndex ]
    );
  }    

  /*------------------------------------------------------------
   *  Column Headers with Menus
   *------------------------------------------------------------
   */

  var trHead = headerTable.insertRow(headerTable.rows.length);
  DOM.bind(
      $(trHead.insertCell(trHead.cells.length))
      .attr("colspan", "3")
      .addClass("column-header")
      .html(
        '<div class="column-header-title">' +
          '<a class="column-header-menu" bind="dropdownMenu"></a><span class="column-header-name">'+$.i18n('core-views/all')+'</span>' +
        '</div>'
      )
  ).dropdownMenu.click(function() {
    self._createMenuForAllColumns(this);
  });
  /*DOM.bind(
	      $(trHead.insertCell(trHead.cells.length))
	      .attr("colspan", "1")
	      .addClass("column-header")
	      .html(
	        '<div class="column-header-title">' +
	          '<a class="column-header-menu" bind="dropdownMenu"></a><span class="column-header-name">Status</span>' +
	        '</div>'
	      )
	  ).dropdownMenu.click(function() {
	    self._createMenuForAllColumns(this);
	  });*/
  this._columnHeaderUIs = [];
  var createColumnHeader = function(column, index) {
    var td = trHead.insertCell(trHead.cells.length);
    $(td).addClass("column-header").attr('title', column.name);
    if (column.name in self._collapsedColumnNames) {
      $(td).html("&nbsp;").click(function(evt) {
        delete self._collapsedColumnNames[column.name];
        self.render();
      });
    } else {
      var columnHeaderUI = new DataTableColumnHeaderUI(self, column, index, td);
      self._columnHeaderUIs.push(columnHeaderUI);
    }
  };

  for (var i = 0; i < columns.length; i++) {
    createColumnHeader(columns[i], i);
  }

  /*------------------------------------------------------------
   *  Data Cells
   *------------------------------------------------------------
   */

  var rows = theProject.rowModel.rows;
  var even = true;
  
  for (var r = 0; r < rows.length; r++) {
	    var row = rows[r];
	    var cells = row.cells;
	    
	    var tr = table.insertRow(table.rows.length);
	    if (theProject.rowModel.mode == "row-based" || "j" in row) {
	      even = !even;
	    }
	    
	    var columns = theProject.columnModel.columns;
	    var colLength = sessionStorage.getItem("columnLength");
	    if(colLength == null){
	    	sessionStorage.setItem("columnLength", columns.length);
	    	colLength = columns.length;
	    }
	    var originalData = rows[r].cells.slice(0, colLength);
	    
	    // Check Empty cells
	    var valid = originalData.filter(cell => cell === null);
	    if(valid.length == 0){
	    	incomplete[r] = false;
	    } else {
	    	incomplete[r] = true;
	    }
	    self.renderRow(tr, r, row, even);
  }
    
  $(table.parentNode).bind('scroll', function(evt) {
    self._adjustDataTableScroll();
  });
};

DataTableView.prototype.renderRow = function(tr, r, row, even) {
	self = this;
    $(tr).empty();
    var columns = theProject.columnModel.columns;
    var cells = row.cells;

    var tdStar = tr.insertCell(tr.cells.length);
    var star = $('<a href="javascript:{}">&nbsp;</a>')
    .addClass(row.starred ? "data-table-star-on" : "data-table-star-off")
    .appendTo(tdStar)
    .click(function() {
      var newStarred = !row.starred;

      Refine.postCoreProcess(
        "annotate-one-row",
        { row: row.i, starred: newStarred },
        null,
        {},
        {
          onDone: function(o) {
            row.starred = newStarred;
            self.renderRow(tr, r, row, even);
            self._adjustDataTables();
          }
        },
        "json"
      );
    });

    var tdFlag = tr.insertCell(tr.cells.length);
    var flag = $('<a href="javascript:{}">&nbsp;</a>')
    .addClass(row.flagged ? "data-table-flag-on" : "data-table-flag-off")
    .appendTo(tdFlag)
    .click(function() {
      var newFlagged = !row.flagged;

      Refine.postCoreProcess(
        "annotate-one-row",
        { row: row.i, flagged: newFlagged },
        null,
        {},
        {
          onDone: function(o) {
            row.flagged = newFlagged;
            self.renderRow(tr, r, row, even);
            self._adjustDataTables();
          }
        },
        "json"
      );
    });

    var tdIndex = tr.insertCell(tr.cells.length);
    if (theProject.rowModel.mode == "record-based") {
      if ("j" in row) {
    	$(tr).addClass("record");
        $('<div></div>').html((row.j + 1) + ".").appendTo(tdIndex);
      } else {
        $('<div></div>').html("&nbsp;").appendTo(tdIndex);
      }
    } else {
      $('<div></div>').html((row.i + 1) + ".").appendTo(tdIndex);
    }
    
    /*var tdIndex = tr.insertCell(tr.cells.length);
    if (theProject.rowModel.mode == "record-based") {
      if ("j" in row) {
        $(tr).addClass("record");
        $('<div></div>').html("Success").appendTo(tdIndex);
      } else {
        $('<div></div>').html("&nbsp;").appendTo(tdIndex);
      }
    } else {
      $('<div></div>').html("Success").appendTo(tdIndex);
    }*/

    $(tr).addClass(even ? "even" : "odd");
    /*if(incomplete[r] != null){
	    if(incomplete[r]) {
	    	$(tr).addClass("incomplete");
	    } else {
	    	$(tr).addClass("valid");
	    }
	}*/
    
    for (var i = 0; i < columns.length; i++) {
      var column = columns[i];
      var td = tr.insertCell(tr.cells.length);
      if (column.name in self._collapsedColumnNames) {
        td.innerHTML = "&nbsp;";
      } else {
    	  var cell = (column.cellIndex < cells.length) ? cells[column.cellIndex] : null;
    	  var colName = sessionStorage.getItem("statusColName");
    	  var temp = JSON.parse(JSON.stringify(Refine.columnNameToColumn(colName)));
    	  if(temp == null){
    		  temp = JSON.parse(JSON.stringify(Refine.columnNameToColumn(colName+"1")));
    	  }
    	  var validCells = false;
    	  if(temp != null){
    	  if(column.cellIndex == temp.cellIndex){
    		  var cellValue = JSON.parse(JSON.stringify(cell));
    		  if(cellValue != null){
    	  if(incomplete[r] != null){
    		  if(cellValue.v == 'Duplicate'){
    			  $(td).css('background-color', 'red');
    		  } else {
    		    if(incomplete[r]) {
    		    	$(td).css('background-color', 'yellow');
    		    } else {
    		    	validCells = true;
    		    	$(td).css('background-color', 'green');
    		    }
    		  }
    	  }
    		}
    	  }
    	  }
        
        new DataTableCellUI(self, cell, row.i, column.cellIndex, td, validCells);
      }
    }
  };

DataTableView.prototype._adjustDataTables = function() {
  var dataTable = this._div.find('.data-table');
  var headerTable = this._div.find('.data-header-table');
  if (dataTable.length === 0 || headerTable.length === 0) {
    return;
  }
  dataTable = dataTable[0];
  headerTable = headerTable[0];
  
  if (dataTable.rows.length === 0) {
    return;
  }
  
  var dataTr = dataTable.rows[0];
  var headerTr = headerTable.rows[headerTable.rows.length - 1];
  
  var marginColumnWidths =
    $(dataTr.cells[0]).outerWidth(true) +
    $(dataTr.cells[1]).outerWidth(true) +
    $(dataTr.cells[2]).outerWidth(true) -
    DOM.getHPaddings($(headerTr.cells[0])) + 1;
  
  $(headerTable)
    .find('> tbody > tr > td:first-child')
    .width('1%')
    .children()
      .first()
      .width(marginColumnWidths);
  
  for (var i = 1; i < headerTr.cells.length; i++) {
    var headerTd = $(headerTr.cells[i]);
    var dataTd = $(dataTr.cells[i + 2]);
    var commonWidth = Math.max(
      Math.min(headerTd.width(), 100),
      dataTd.width()
    );
    headerTd.width('1%').find('> div').width(commonWidth);
    dataTd.children().first().width(commonWidth);
  }
  
  this._adjustDataTableScroll();
};

DataTableView.prototype._adjustDataTableScroll = function() {
  var dataTableContainer = this._div.find('.data-table-container');
  var headerTableContainer = this._div.find('.data-header-table-container');
  if (dataTableContainer.length > 0 && headerTableContainer.length > 0) {
    headerTableContainer
      .find('> .data-header-table')
      .css('left', '-' + dataTableContainer[0].scrollLeft + 'px');
  }
};

DataTableView.prototype._showRows = function(start, onDone) {
  var self = this;

  Refine.fetchRows(start, this._pageSize, function() {
    self.render();
    if (onDone) {
      onDone();
    }
  }, this._sorting);
};

DataTableView.prototype._onClickPreviousPage = function(elmt, evt) {
  this._showRows(theProject.rowModel.start - this._pageSize);
};

DataTableView.prototype._onClickNextPage = function(elmt, evt) {
  this._showRows(theProject.rowModel.start + this._pageSize);
};

DataTableView.prototype._onClickFirstPage = function(elmt, evt) {
  this._showRows(0);
};

DataTableView.prototype._onClickLastPage = function(elmt, evt) {
  this._showRows(Math.floor((theProject.rowModel.filtered - 1) / this._pageSize) * this._pageSize);
};

DataTableView.prototype._getSortingCriteriaCount = function() {
  return this._sorting.criteria.length;
};

DataTableView.prototype._sortedByColumn = function(columnName) {
  for (var i = 0; i < this._sorting.criteria.length; i++) {
    if (this._sorting.criteria[i].column == columnName) {
      return true;
    }
  }
  return false;
};

DataTableView.prototype._getSortingCriterionForColumn = function(columnName) {
  for (var i = 0; i < this._sorting.criteria.length; i++) {
    if (this._sorting.criteria[i].column == columnName) {
      return this._sorting.criteria[i];
    }
  }
  return null;
};

DataTableView.prototype._removeSortingCriterionOfColumn = function(columnName) {
  for (var i = 0; i < this._sorting.criteria.length; i++) {
    if (this._sorting.criteria[i].column == columnName) {
      this._sorting.criteria.splice(i, 1);
      break;
    }
  }
  this.update();
};

DataTableView.prototype._addSortingCriterion = function(criterion, alone) {
  if (alone) {
    this._sorting.criteria = [];
  } else {
    for (var i = 0; i < this._sorting.criteria.length; i++) {
      if (this._sorting.criteria[i].column == criterion.column) {
        this._sorting.criteria[i] = criterion;
        this.update();
        return;
      }
    }
  }
  this._sorting.criteria.push(criterion);
  this.update();
};

DataTableView.prototype._addSortingCriterionColDuplicate = function(criterion, columnName) {
	var self = this;
	
	for (var i = 0; i < this._sorting.criteria.length; i++) {
	      if (this._sorting.criteria[i].column == criterion.column) {
	        this._sorting.criteria[i] = criterion;
	        this.update();
	        return;
	      }
	    }
	  this._sorting.criteria.push(criterion);
	  this.update();
	  Refine.postCoreProcess(
              "reorder-rows",
              null,
              {
                "sorting" : JSON.stringify(self._sorting),
                "mode" : ui.browsingEngine.getMode()
              },
              { rowMetadataChanged: true },
              {
                onDone: function() {
                	self._sorting.criteria = [];
                	var rows = theProject.rowModel.rows;
                	var dataTable = self._div.find('.data-table');
            	    var table = dataTable[0];
                	findDuplicatesFromColumn(rows, self, table, columnName);
                }
              }
            );
	};
	
	var findDuplicatesFromColumn = function(_rows, self, table, columnName) {
	    
		Refine.fetchRows(theProject.rowModel.start, theProject.rowModel.filtered, function() {
			 var rows = theProject.rowModel.rows;
			 //console.log("Row========>"+JSON.stringify(rows));
			  var status; 
				var temp = JSON.parse(JSON.stringify(Refine.columnNameToColumn(columnName)));
				var index = temp.cellIndex;
				
			  for (var r = 0; r < rows.length; r++) {
				  statusList[r] = "Valid";
				  
				// Check Empty cells
			    var valid = rows[r].cells.filter(cell => cell === null);
			    if(valid.length == 0){
			    	incomplete[r] = false;
			    } else {
			    	incomplete[r] = true;
			    	statusList[r] = "Incomplete";
			    }
			    
			    // Check duplicate column
			    if(r == 0 && rows.length > 0) {
			    	if(JSON.stringify(rows[r].cells[index]) == JSON.stringify(rows[r+1].cells[index])){
		  	    		duplicate[r] = true;
		  	    		statusList[r] = "Duplicate";
		  	    	} else {
		  	        	duplicate[r] = false; 
		  	        }
			    } else if(r == (rows.length-1)) {
			    	if(JSON.stringify(rows[r].cells[index]) == JSON.stringify(rows[r-1].cells[index])){
		  	    		duplicate[r] = true;
		  	    		statusList[r] = "Duplicate";
		  	    	} else {
		  	        	duplicate[r] = false; 
		  	        }
			    } else {
			    	if(JSON.stringify(rows[r].cells[index]) == JSON.stringify(rows[r+1].cells[index]) ||
			    			JSON.stringify(rows[r].cells[index]) == JSON.stringify(rows[r-1].cells[index])){
		  	    		duplicate[r] = true;
		  	    		statusList[r] = "Duplicate";
		  	    	} else {
		  	        	duplicate[r] = false; 
		  	        }
			    }
		  }
			  
			  Refine.postCoreProcess(
		    	      "blank-down",
		    	      {
		    	        columnName: columnName
		    	      },
		    	      null,
		    	      { modelsChanged: true },
		    	      {
		    	    	  onDone: function(o) {
					        	var expQuery = "grel:if(value==null, 'Duplicate', 'Non-Duplicate')";
								  Refine.postCoreProcess(
									      "add-column", 
									      {
									        baseColumnName: columnName,  
									        newColumnName: columnName+1, 
									        columnInsertIndex: 0,
									        onError: "keep-original"
									      },
									      { expression: expQuery.toString() },
									      { modelsChanged: true },
									      {
									        onDone: function(o) {
									        	Refine.postCoreProcess(
									        		      "remove-column", 
									        		      {
									        		        columnName: columnName
									        		      },
									        		      null,
									        		      { modelsChanged: true },
									        		      {
									        		    	  onFinallyDone: function(o) {
														        	Refine.postCoreProcess(
														        	        "rename-column", 
														        	        {
														        	          oldColumnName: columnName+1,
														        	          newColumnName: columnName
														        	        },
														        	        null,
														        	        { modelsChanged: true }
														        	      );
														        	
														        }
														      }
									        		    );
									        }
									      }
									    );
					        }
					      }
		    	    );
		  }, this._sorting);
	};
	
/** below can be move to seperate file **/
  var doTextTransformPrompt = function() {
    var frame = $(
        DOM.loadHTML("core", "scripts/views/data-table/text-transform-dialog.html")
        .replace("$EXPRESSION_PREVIEW_WIDGET$", ExpressionPreviewDialog.generateWidgetHtml()));

    var elmts = DOM.bind(frame);
    elmts.or_views_errorOn.text($.i18n('core-views/on-error'));
    elmts.or_views_keepOr.text($.i18n('core-views/keep-or'));
    elmts.or_views_setBlank.text($.i18n('core-views/set-blank'));
    elmts.or_views_storeErr.text($.i18n('core-views/store-err'));
    elmts.or_views_reTrans.text($.i18n('core-views/re-trans'));
    elmts.or_views_timesChang.text($.i18n('core-views/times-chang'));
    elmts.okButton.html($.i18n('core-buttons/ok'));
    elmts.cancelButton.text($.i18n('core-buttons/cancel'));    

    var level = DialogSystem.showDialog(frame);
    var dismiss = function() { DialogSystem.dismissUntil(level - 1); };

    elmts.cancelButton.click(dismiss);
    elmts.okButton.click(function() {
        new ExpressionColumnDialog(
                previewWidget.getExpression(true),
                $('input[name="text-transform-dialog-onerror-choice"]:checked')[0].value,
                elmts.repeatCheckbox[0].checked,
                elmts.repeatCountInput[0].value
        );
    });
    
    var previewWidget = new ExpressionPreviewDialog.Widget(
      elmts,
      -1,
      [],
      [],
      null
    );
    previewWidget._prepareUpdate = function(params) {
      params.repeat = elmts.repeatCheckbox[0].checked;
      params.repeatCount = elmts.repeatCountInput[0].value;
    };
  };
  /** above can be move to seperate file **/
  
DataTableView.prototype._createMenuForAllColumns = function(elmt) {
  var self = this;
  var menu = [
        {
            label: $.i18n('core-views/transform'),
            id: "core/facets",
            width: "200px",
            click: function() {
                   doTextTransformPrompt();
            }
        },
    {},
    {
      label: $.i18n('core-views/facet'),
      id: "core/facets",
      width: "200px",
      submenu: [
        {
          label: $.i18n('core-views/facet-star'),
          id: "core/facet-by-star",
          click: function() {
            ui.browsingEngine.addFacet(
              "list", 
              {
                "name" : $.i18n('core-views/starred-rows'),
                "columnName" : "", 
                "expression" : "row.starred"
              },
              {
                "scroll" : false
              }
            );
          }
        },
        {
          label: $.i18n('core-views/facet-flag'),
          id: "core/facet-by-flag",
          click: function() {
            ui.browsingEngine.addFacet(
              "list", 
              {
                "name" : $.i18n('core-views/flagged-rows'),
                "columnName" : "", 
                "expression" : "row.flagged"
              },
              {
                "scroll" : false
              }
            );
          }
        },
        {
          label: $.i18n('core-views/facet-blank'),
          id: "core/facet-by-blank",
          click: function() {
            ui.browsingEngine.addFacet(
              "list", 
              {
                "name" : $.i18n('core-views/blank-rows'),
                "columnName" : "", 
                "expression" : "(filter(row.columnNames,cn,isNonBlank(cells[cn].value)).length()==0).toString()"
              },
              {
                "scroll" : false
              }
            );
          }
        },
        {
          label: $.i18n('core-views/non-blank-values'),
          id: "core/non-blank-values",
          click: function() {
            ui.browsingEngine.addFacet(
              "list", 
              {
                "name" : $.i18n('core-views/non-blank-values'),
                "columnName" : "", 
                "expression" : "filter(row.columnNames,cn,isNonBlank(cells[cn].value))"
              },
              {
                "scroll" : false
              }
            );
          }
        },
        {
          label: $.i18n('core-views/non-blank-records'),
          id: "core/non-blank-records",
          click: function() {
            ui.browsingEngine.addFacet(
              "list", 
              {
                "name" : $.i18n('core-views/non-blank-records'),
                "columnName" : "", 
                "expression" : "filter(row.columnNames,cn,isNonBlank(if(row.record.fromRowIndex==row.index,row.record.cells[cn].value.join(\"\"),null)))"
              },
              {
                "scroll" : false
              }
            );
          }
        }
      ]
    },
    {},
    {
      label: $.i18n('core-views/edit-rows'),
      id: "core/edit-rows",
      width: "200px",
      submenu: [
        {
          label: $.i18n('core-views/star-rows'),
          id: "core/star-rows",
          click: function() {
            Refine.postCoreProcess("annotate-rows", { "starred" : "true" }, null, { rowMetadataChanged: true });
          }
        },
        {
          label: $.i18n('core-views/unstar-rows'),
          id: "core/unstar-rows",
          click: function() {
            Refine.postCoreProcess("annotate-rows", { "starred" : "false" }, null, { rowMetadataChanged: true });
          }
        },
        {},
        {
          label: $.i18n('core-views/flag-rows'),
          id: "core/flag-rows",
          click: function() {
            Refine.postCoreProcess("annotate-rows", { "flagged" : "true" }, null, { rowMetadataChanged: true });
          }
        },
        {
          label: $.i18n('core-views/unflag-rows'),
          id: "core/unflag-rows",
          click: function() {
            Refine.postCoreProcess("annotate-rows", { "flagged" : "false" }, null, { rowMetadataChanged: true });
          }
        },
        {},
        {
          label: $.i18n('core-views/remove-matching'),
          id: "core/remove-rows",
          click: function() {
            Refine.postCoreProcess("remove-rows", {}, null, { rowMetadataChanged: true });
          }
        }
      ]
    },
    {
      label: $.i18n('core-views/edit-col'),
      id: "core/edit-columns",
      width: "200px",
      submenu: [
        {
          label: $.i18n('core-views/reorder-remove')+"...",
          id: "core/reorder-columns",
          click: function() {
            new ColumnReorderingDialog();
          }
        }
      ]
    },
    {},
    {
      label: $.i18n('core-views/view'),
      id: "core/view",
      width: "200px",
      submenu: [
        {
          label: $.i18n('core-views/collapse-all'),
          id: "core/collapse-all-columns",
          click: function() {
            for (var i = 0; i < theProject.columnModel.columns.length; i++) {
              self._collapsedColumnNames[theProject.columnModel.columns[i].name] = true;
            }
            self.render();
          }
        },
        {
          label: $.i18n('core-views/expand-all'),
          id: "core/expand-all-columns",
          click: function() {
            self._collapsedColumnNames = [];
            self.render();
          }
        },
        {
          label: $.i18n('core-views/display-null'),
          id: "core/display-null",
          click: function() {
            $(".data-table-null").toggle();
            self._shownulls = !(self._shownulls);
          }
        }
      ]
    },
    {},
    {
        label: $.i18n('core-views/functional-integrity-check'),
        id: "core/functional-integrity-check",
        click: function() {
               //TODO: FunctionalIntegrityCheck;
        }
    },
    {},
    {
        label: $.i18n('core-views/check-duplicates'),
        id: "core/check-duplicates",
        click: function() {
        	new CheckColumnDuplicatesDialog(self);
        }
    }
  ];

  for (var i = 0; i < DataTableView._extenders.length; i++) {
    DataTableView._extenders[i].call(null, this, menu);
  }

  MenuSystem.createAndShowStandardMenu(menu, elmt, { width: "160px", horizontal: false });
};

DataTableView.prototype._createSortingMenu = function(elmt) {
  var self = this;
  var items = [
    {
      "label" : $.i18n('core-views/remove-sort'),
      "click" : function() {
        self._sorting.criteria = [];
        self.update();
      }
    },
    {
      "label" : $.i18n('core-views/reorder-perma'),
      "click" : function() {
        Refine.postCoreProcess(
          "reorder-rows",
          null,
          {
            "sorting" : JSON.stringify(self._sorting),
            "mode" : ui.browsingEngine.getMode()
          },
          { rowMetadataChanged: true },
          {
            onDone: function() {
              self._sorting.criteria = [];
            }
          }
        );
      }
    },
    {}
  ];

  var getColumnHeaderUI = function(columnName) {
    for (var i = 0; i < self._columnHeaderUIs.length; i++) {
      var columnHeaderUI = self._columnHeaderUIs[i];
      if (columnHeaderUI.getColumn().name == columnName) {
        return columnHeaderUI;
      }
    }
    return null;
  };
  var createSubmenu = function(criterion) {
    var columnHeaderUI = getColumnHeaderUI(criterion.column);
    if (columnHeaderUI !== null) {
      items.push({
        "label" : $.i18n('core-views/by')+" " + criterion.column,
        "submenu" : columnHeaderUI.createSortingMenu()
      });
    }
  };
  for (var i = 0; i < this._sorting.criteria.length; i++) {
    createSubmenu(this._sorting.criteria[i]);
  }

  MenuSystem.createAndShowStandardMenu(items, elmt, { horizontal: false });
};


DataTableView.prototype._updateCell = function(rowIndex, cellIndex, cell) {
  var rows = theProject.rowModel.rows;
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    if (row.i === rowIndex) {
      while (cellIndex >= row.cells.length) {
        row.cells.push(null);
      }
      row.cells[cellIndex] = cell;
      break;
    }
  }
};

DataTableView.sampleVisibleRows = function(column) {
  var rowIndices = [];
  var values = [];

  var rows = theProject.rowModel.rows;
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];

    rowIndices.push(row.i);

    var v = null;
    if (column && column.cellIndex < row.cells.length) {
      var cell = row.cells[column.cellIndex];
      if (cell !== null) {
        v = cell.v;
      }
    }
    values.push(v);
  }

  return {
    rowIndices: rowIndices,
    values: values
  };
};

DataTableView.promptExpressionOnVisibleRows = function(column, title, expression, onDone) {
  var o = DataTableView.sampleVisibleRows(column);

  var self = this;
  new ExpressionPreviewDialog(
    title,
    column.cellIndex, 
    o.rowIndices, 
    o.values,
    expression,
    onDone
  );
};
