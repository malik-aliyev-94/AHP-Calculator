/* Coomon */
function alertSuccess(msg) {
    Lobibox.notify("success", {
        soundPath: 'assets/alert/sounds/',
        size: 'mini',
        rounded: false,
        delayIndicator: true,
        msg: msg
    });
}

function alertError(msg) {
    Lobibox.notify("error", {
        soundPath: 'assets/alert/sounds/',
        size: 'mini',
        rounded: false,
        delayIndicator: true,
        msg: msg
    });
}

function openModal(title, label) {
    $('#modal #myModalLabel').text(title);
    $('#modal label').text(label);
}

function isEmptyField(field, msg) {
    if ($.trim(field.val()) == "") return true;
    else return false;
}

/* Common edit/remove functions */
function initEditForm(id) {
    var value = $.trim($('*[data-id=' + id + ']').attr('data-value'));
    $('#modal .modal-body input').val(value);
}

function editItem(id, _draw) {
    var value = $.trim($('#modal .modal-body input').val());
    if (value == "") {
        alertError('Can not be empty.');
    } else {
        $('*[data-id=' + id + ']').find('.name').text(value);
        $('*[data-id=' + id + ']').attr('data-value', value);
        $('#modal .modal-body input').val("");
        $('#close-modal').trigger('click');
        if (_draw === true) draw();
    }
}

function removeItem(id, _draw) {
    $('*[data-id=' + id + ']').remove();
    if (_draw === true) draw();
    constructTables();
}

/* Alternatives */
function addAlternative(alternative) {
    var id = "a-" + Math.random().toString(36).substring(7);
    var tpl = $('<li data-id="' + id + '" data-value="' + alternative + '" />');
    tpl.append('<span class="name">' + alternative + '</span><span class="buttons"></span>');
    tpl.find('.buttons').append("<a href='#' data-alt='" + id + "' class='edit' data-toggle='modal' data-target='#modal'><i class='fa fa-edit'></i></a>");
    tpl.find('.buttons').append("<a href='#' data-alt='" + id + "' class='remove'><i class='fa fa-times'></i></a>");

    $('#alternatives').append(tpl);
    constructTables();
}

function getAlternatives() {
    var alternatives = [];
    $('#alternatives li').each(function() {
        var id = $.trim($(this).attr('data-id'));
        var alt = $.trim($(this).attr('data-value'));
        alternatives.push({
            id: id,
            name: alt
        });
    });
    return alternatives;
}

/* Criterias */
function addCriteria(parent) {
    var value = $.trim($('#modal .modal-body input').val());
    if (value == "") {
        alertError('Empty criteria.');
    } else {
        // parent id
        var _parent = $('*[data-id=' + parent + ']');
        var ul = _parent.find('>ul');
        if (!ul.length) _parent.append("<ul></ul>");
        var id = "c-" + Math.random().toString(36).substring(7);
        var tpl = $('<li data-id="' + id + '" data-value="' + value + '" />');
        tpl.append('<span class="main"><span class="name">' + value + '</span><span class="buttons"></span></span>');
        tpl.find('.buttons').append("<a href='#' data-criteria='" + id + "' class='add-child' data-toggle='modal' data-target='#modal'><i class='fa fa-plus'></i></a>");
        tpl.find('.buttons').append("<a href='#' data-criteria='" + id + "' class='edit' data-toggle='modal' data-target='#modal'><i class='fa fa-edit'></i></a>");
        tpl.find('.buttons').append("<a href='#' data-criteria='" + id + "' class='remove'><i class='fa fa-times'></i></a>");
        _parent.find('>ul').append(tpl);
        $('#modal .modal-body input').val("");
        $('#close-modal').trigger('click');
        draw();
    }
}

function getCriterias() {
    var mainCriterias = [];
    $('#criterias li').each(function() {
        var name = $(this).attr('data-value');
        var id = $(this).attr('data-id');
        var children = $(this).find('>ul>li');
        if (!children.length) {
            mainCriterias.push({
                id: id,
                name: name
            });
        }
    });
    return mainCriterias;
}

function tree() {
    var criterias = $('#criterias>li>ul li');
    var tree = {};
    criterias.each(function() {
        var cID = $(this).attr('data-id');
        var cName = $(this).attr('data-value');
        tree[cID] = {
            'name': cName,
            'parents': []
        };
        var parents = $(this).parents('li').each(function() {
            var pID = $(this).attr('data-id');
            if (pID != 'c-root')
                tree[cID]['parents'].push(pID);
        });
    });
    return tree;
}

/* Hierarchy */
function children(middleware, index, id) {
    var node = $('*[data-id=' + id + ']');
    var id = $(this).attr('data-id');
    var index = $(this).index();
    var name = $.trim(node.find('>.main .name').text());
    var _children = node.find('>ul>li');
    if (_children.length) {
        _children.each(function(i) {
            var childID = $(this).attr('data-id');
            var childIndex = $(this).index();
            var childName = $(this).find('>.main .name').text();
            middleware.push({ id: childID, name: childName, children: [] });
            var cs = $(this).find('>ul>li');
            if (cs.length)
                children(middleware[i]['children'], childIndex, childID);
        });
    } else {
        return;
    }
}

function extractData() {
    var data = {};
    var list = $('#criterias');
    list.find(">li").each(function() {
        var node = $(this);
        var id = $(this).attr('data-id');
        var index = $(this).index();
        var name = $.trim(node.find('>.main .name').text());
        var parents = node.parents('li');
        var middleware = data;
        middleware['id'] = id;
        middleware['name'] = name;
        middleware['children'] = [];
        children(middleware['children'], index, id);
        var _children = node.find('>ul>li');
    });

    return data;
}

function draw(data, noncollapsable) {
    $('#chart-container').empty();
    if (data === undefined) data = extractData();
    $('#chart-container').orgchart({
        'data': data,
        'parentNodeSymbol': '',
        'exportButton': true,
        'exportFilename': 'MyOrgChart',
        'exportFileextension': 'pdf',
        'pan': true
    });
    if (noncollapsable === true) $('.orgchart').addClass('noncollapsable');
    $('.oc-export-btn').wrap('<div style="text-align:right; padding: 10px;"></div>');

    constructTables();
}

function criteriasGroups() {
    var groups = [];

    var subCriteriaUL = $('#criterias ul');
    subCriteriaUL.each(function(){
        var cs = [];
        $(this).find('>li').each(function(){
            cs.push({
                name: $(this).attr('data-value'),
                id: $(this).attr('data-id')
            });
        });
        groups.push(cs);
    });

    var mainCriterias = [];
    $('#criterias>li ul li').each(function() {
        var children = $(this).find('>ul>li');
        if (!children.length) {
            mainCriterias.push({
                id: $(this).attr('data-id'),
                name: $(this).attr('data-value')
            });
        }
    });
    if (mainCriterias.length !== 0) groups.push(mainCriterias);
    return groups;
}

function constructTables() {
    $('#tables').empty();
    $('#alternatives-weights').empty();
    var alternatives = getAlternatives();
    var criterias = criteriasGroups();
    
    if (alternatives.length > 1 && criterias.length > 1) {

        for (var x=0; x<criterias.length-1; x++) {
            var localCriterias = criterias[x];
            var container = "table-container-" + Math.random().toString(36).substring(7);
            $('#tables').append('<div id="' + container + '"></div>');
            constructTable("Compare local criterias", {"class":"data-table data-table-criterias"}, localCriterias, container);
        }

        var mainCS = getCriterias();
        for (z in mainCS) {
            var container = "table-container-" + Math.random().toString(36).substring(7);
            $('#alternatives-weights').append('<div id="' + container + '"></div>');
            constructTable("Compare alternatives by criteria: "+mainCS[z]['name'], {"class":"data-table data-table-alternatives", "data-criteria": mainCS[z]['id']}, alternatives, container);
        }

    }
}

function constructTable(title, attrs, data, container) {
    var id = "data-table-" + Math.random().toString(36).substring(7);
    var table = $('<table class="data-table" id="' + id + '" />');
    for (attr in attrs) {
        table.attr(attr, attrs[attr]);
    }
    table.attr('data-ri', data.length);
    table.prepend("<caption>" + title + "</caption>");
    table.prepend("<tbody></tbody>");
    for (var i = 0; i < data.length; i++) {
        var tr = $('<tr data-item="'+data[i]['id']+'" data-name="'+data[i]['name']+'" />')
        for (var j = 0; j < data.length; j++) {
            var td = $('<td data-i="' + i + '" data-j="' + j + '" class="data-table-cell" />');
            // td.html('&nbsp;');
            if (i == j) {
                td.attr('data-value', 1).text(1).addClass('data-table-cell-diagonal');
            } else if (i > j) {
                td.attr('data-value', 1).addClass('data-table-cell-disabled').text(1);
            } else {
                td.attr('data-value', 1).addClass('data-table-cell-enabled');
                var select = $('<select />');
                var options = [1 / 9, 1 / 7, 1 / 5, 1 / 3, 1, 3, 5, 7, 9];
                var options = [
                    { value: '1/9', reverse: 9 },
                    { value: '1/8', reverse: 8 },
                    { value: '1/7', reverse: 7 },
                    { value: '1/6', reverse: 6 },
                    { value: '1/5', reverse: 5 },
                    { value: '1/4', reverse: 4 },
                    { value: '1/3', reverse: 3 },
                    { value: '1/2', reverse: 2 },
                    { value: '1', reverse: 1 },
                    { value: '2', reverse: '1/2' },
                    { value: '3', reverse: '1/3' },
                    { value: '4', reverse: '1/4' },
                    { value: '5', reverse: '1/5' },
                    { value: '6', reverse: '1/6' },
                    { value: '7', reverse: '1/7' },
                    { value: '8', reverse: '1/8' },
                    { value: '9', reverse: '1/9' },
                ];
                for (index in options) {
                    var option = options[index];
                    select.prepend('<option value="' + option['value'] + '" data-reverse="' + option['reverse'] + '">' + option['value'] + '</option>');
                    select.find('option[value=1]').prop('selected', true);
                }
                td.empty().append(select);
            }
            tr.append(td);
        }
        table.find('tbody').append(tr);
    }
    table.prepend('<tr><td class="data-table-cell-hh"></td></tr>');
    table.append('<tr><td class="data-table-cell-hh">Total</td></tr>');
    for (var i = 0; i < data.length; i++) {
        table.find('tr').eq(i + 1).prepend('<td class="data-table-cell-h">' + data[i]['name'] + '</td>');
        table.find('tr').eq(i + 1).append('<td class="data-table-cell-result data-table-cell-mean" data-id="'+data[i]['id']+'" data-value="0">0</td>');
        table.find('tr').eq(i + 1).append('<td class="data-table-cell-result data-table-cell-weight" data-id="'+data[i]['id']+'" data-value="0">0</td>');
        table.find('tr').first().append('<td class="data-table-cell-h">' + data[i]['name'] + '</td>');
        table.find('tr').last().append('<td class="data-table-cell-total" data-value="0">0</td>');
    }
    table.find('tr').first().append('<td class="data-table-cell-result-h">v<sub>i</sub></td>');
    table.find('tr').first().append('<td class="data-table-cell-result-h">w<sub>i</sub></td>');
    table.find('tr').last().append("<td class='data-table-cell-means-total' data-value='0'>0</td><td></td>");
    $('#' + container).empty().append(table);
    calc(id);
}

function calc(id) {
    var _RI = {
        '1': 0,
        '2': 0,
        '3': 0.52,
        '4': 0.89,
        '5': 1.11,
        '6': 1.25,
        '7': 1.35,
        '8': 1.40,
        '9': 1.45,
        '10': 1.49
    };
    var table = $('table#' + id);
    var totalRow = table.find('tr').last();
    var rows = table.find('tbody tr').not(':first').not(':last');
    var summ = 0;
    table.find('.data-table-cell-total').attr('data-value', 0);
    rows.each(function() {
        var multip = 1;
        var dataCells = $(this).find('td.data-table-cell');
        dataCells.each(function() {
            var td = $(this);
            var value = eval($(this).attr('data-value'));
            multip = (multip * value.toFixed(3)).toFixed(3);

            var totalRowCell = totalRow.find('td').eq($(this).index());
            var totalRowValue = +totalRowCell.attr('data-value') + value;
            totalRowCell.attr('data-value', totalRowValue.toFixed(3)).text(totalRowValue.toFixed(3));
        });
        var result = Math.pow(multip, 1 / dataCells.length).toFixed(3);
        summ += +result;
        $(this).find('.data-table-cell-mean').attr('data-value', result).text(result);
    });
    table.find('.data-table-cell-means-total').attr('data-value', summ.toFixed(3)).text(summ.toFixed(3));
    var lambda = 0;
    rows.each(function() {
        var mean = +$(this).find('.data-table-cell-mean').attr('data-value');
        var weight = (mean / summ).toFixed(3);
        $(this).find('.data-table-cell-weight').attr('data-value', weight).text(weight);
        lambda += weight * Number(totalRow.find('td').eq($(this).index()).attr('data-value'));
    });

    var l = lambda.toFixed(3);
    var n = table.attr('data-ri');
    var RI = +_RI[n];
    var CI = ((l - Number(n)) / (Number(n) - 1)).toFixed(3);
    var CR = RI ? (CI / RI).toFixed(3) : "-";

    if (table.next(".calc-result").length) table.next(".calc-result").remove();
    table.after('<div class="calc-result"></div>');
    table.next(".calc-result").append('<p><b>n</b>: ' + n + '</p>');
    table.next(".calc-result").append('<p><b>&#955;<sub>max</sub></b>: ' + l + '</p>');
    table.next(".calc-result").append('<p><b>RI</b>: ' + RI + '</p>');
    table.next(".calc-result").append('<p><b>CI</b>: ' + CI + '</p>');
    table.next(".calc-result").append('<p><b>CR</b>: ' + CR + '</p>');

    var mainCriterias = getCriterias();
    $('#weights table tbody').empty();
    for (p in mainCriterias) {
        var cr = mainCriterias[p];
        var name = cr['name'];
        var id = cr['id'];
        var local = +$('.data-table-criterias .data-table-cell-weight[data-id='+id+']').attr('data-value');
        var _tree = tree();
        
        var mult = 1;
        var parents = _tree[id]['parents'];
        if (parents.length) {
            for (pr in parents) {
                mult *= (+$('.data-table-criterias .data-table-cell-weight[data-id='+parents[pr]+']').attr('data-value')).toFixed(3);
            }
        }

        var glob = (mult*local).toFixed(3);
        $('#weights tbody').append('<tr><td>'+name+'</td><td>'+local+'</td><td class="c-weight" data-criteria="'+name+'" data-id="'+id+'" data-value="'+glob+'">'+glob+'</td></tr>');
    }

    var mainTableData = [];
    var globalWeights = [];

    var criteriaRows = $('#weights tbody tr');
    criteriaRows.each(function(){
        var criteriaTD = $(this).find('.c-weight');
        var criteria = {
            id: criteriaTD.attr('data-id'),
            name: criteriaTD.attr('data-criteria'),
            weight: (+criteriaTD.attr('data-value')).toFixed(3)
        };
        globalWeights.push(criteria);
    });

    var alternatives = getAlternatives();
    for (a in alternatives) {
        alternatives[a]['weights'] = {};
        for (g in globalWeights) {
            var tbl = $('.data-table-alternatives[data-criteria='+globalWeights[g]['id']+']');
            var tr = tbl.find('tr[data-item='+alternatives[a]['id']+']');
            alternatives[a]['weights'][globalWeights[g]['id']] = (+tr.find('.data-table-cell-weight').attr('data-value')).toFixed(3)
        }
    }
    
    var resultTable = $('<table class="table table-bordered table-hover" />');
    resultTable.append('<tbody />');
    resultTable.find('tbody').append('<tr><td></td></tr>');
    resultTable.find('tbody').append('<tr><td></td></tr>');
    for (g in globalWeights) {
        resultTable.find('tbody tr').first().append('<td>'+globalWeights[g]['name']+'</td>');
        resultTable.find('tbody tr').eq(1).append('<td>'+globalWeights[g]['weight']+'</td>');
    }
    resultTable.find('tbody tr').first().append('<td></td>');
    resultTable.find('tbody tr').eq(1).append('<td></td>');

    var final = [];

    for (a in alternatives) {
        var r = 0;
        var aTR = $('<tr />'); 
        aTR.append('<td>'+alternatives[a]['name']+'</td>');
        for (g in globalWeights) {
            var weight = Number(alternatives[a]['weights'][globalWeights[g]['id']]).toFixed(3);
            aTR.append('<td>'+weight+'</td>');
            r += weight*globalWeights[g]['weight'];
        }
        aTR.append('<td>'+r.toFixed(3)+'</td>');
        resultTable.find('tbody').append(aTR);
        final.push({
            name: alternatives[a]['name'],
            value: r.toFixed(3)
        });
    }

    $('#ahp-result').empty().append(resultTable);
    
    var CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
    var chartContainer = $('<div class="chart-container" />');
    for (b in final) {
        chartContainer.append('<div style="height: '+final[b]['value']*1000+'px; background: '+CSS_COLOR_NAMES[b+5]+';"><div class="name">'+final[b]['name']+'</div><div class="value">'+(final[b]['value']*100).toFixed(3)+'%</div></div>');
    }

    $('#chart').empty().append(chartContainer);
    


}