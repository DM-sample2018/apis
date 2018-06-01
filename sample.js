'use strict';

(function () {
  $(document).ready(function () {
    const table = $('#parameterTable');
    const tableBody = table.children('tbody');

    tableau.extensions.initializeAsync().then(function () {
      tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
        parameters.forEach(function (p) {
          p.addEventListener(tableau.TableauEventType.ParameterChanged, onParameterChange);
          parameterRow(p).appendTo(tableBody);
        });

        // This is used to manipulate what part of the UI is visible.  If there are no parameters
        // found, we want to give you a message to tell you that you need to add one, otherwise, we
        // show the table we created.
        $('#loading').addClass('hidden');
        if (parameters.length === 0) {
          $('#addParameterWarning').removeClass('hidden').addClass('show');
        } else {
          $('#parameterTable').removeClass('hidden').addClass('show');
        }
      });
    });
  });

  function onParameterChange (parameterChangeEvent) {
    parameterChangeEvent.getParameterAsync().then(function (param) {
      const newRow = parameterRow(param);
      const oldRow = $("tr[data-fieldname='" + param.id + "'");
      oldRow.replaceWith(newRow);
    });
  }

  //
  // DOM creation methods
  //

  // A cell in the table
  function cell (value) {
    const row = $('<td>');
    row.append(value);
    return row;
  }

  // A simple cell that contains a text value
  function textCell (value) {
    const cellElement = $('<td>');
    cellElement.text(value);
    return cellElement;
  }

  function allowableValues (value) {
    function termKey (key) {
      return $('<dt>').attr('id', key).text(key);
    }

    function termValue (value, default_) {
      return $('<dd>').text(value || default_);
    }

    const allowable = $('<dl class="dl-horizontal">');

    switch (value.type) {
      case 'all':
        allowable.append(termKey('Restrictions'));
        allowable.append(termValue('None'));
        break;
      case 'list':
        value.allowableValues.forEach(function (allowableValue) {
          allowable.append(termKey('List Value'));
          allowable.append(termValue(allowableValue.formattedValue));
        });
        break;
      case 'range':
        allowable.append(termKey('Min Value'));
        allowable.append(termValue(value.minValue.formattedValue, 'No Min'));
        allowable.append(termKey('Max Value'));
        allowable.append(termValue(value.maxValue.formattedValue, 'No Max'));
        allowable.append(termKey('Step Size'));
        allowable.append(termValue(value.maxValue.stepSize, 'default'));
        break;
      default:
        console.error('Unknown Parameter value type: ' + value.type);
    }

    return allowable;
  }

  // This function creates a subtree of a row for a specific parameter.
  function parameterRow (p) {
    let row = $('<tr>').attr('data-fieldname', p.id);
    row.append(textCell(p.name));
    row.append(textCell(p.dataType));
    row.append(textCell(p.currentValue.formattedValue));
    row.append(cell(allowableValues(p.allowableValues)));

    return row;
  }
})();
