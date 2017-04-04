$(function() {

    Lobibox.base.DEFAULTS = $.extend({}, Lobibox.base.DEFAULTS, {
        iconSource: 'fontAwesome'
    });
    Lobibox.notify.DEFAULTS = $.extend({}, Lobibox.notify.DEFAULTS, {
        iconSource: 'fontAwesome',
        delay: 1500
    });

    $(document).on('click', '.add-root-alternative button', function() {
        var alternative = $.trim($(this).parent().prev('input').val());
        if (alternative == "") {
            alertError('Empty alternative.');
        } else {
            $(this).parent().prev('input').val("");
            addAlternative(alternative);
        }
    });

    $(document).on('click', '#alternatives a.remove', function(e) {
        removeItem($(this).attr('data-alt'));
        e.preventDefault();
    });

    $(document).on('click', '#alternatives a.edit', function(e) {
        openModal('Edit alternative', 'Alternative');
        var id = $(this).attr('data-alt');
        initEditForm(id);
        $('#modal #save').unbind('click').click(function() {
            editItem(id);
        });
        e.preventDefault();
    });

    $(document).on('keyup', '#goal', function(e) {
        var goal = $.trim($(this).val());
        $('#criterias *[data-id="c-root"]').attr('data-value', goal).find('>.main .name').text(goal);
    });

    $(document).on('change', '#goal', function(e) {
        var goal = $.trim($(this).val());
        if (goal == "") goal = "Goal";
        $('#criterias *[data-id="c-root"]').attr('data-value', goal).find('>.main .name').text(goal);
        $(this).val(goal);
        draw();
    });

    $(document).on('click', '#criterias .add-child', function(e) {
        openModal('Add criteria', 'Criteria');
        var parent = $(this).attr('data-criteria');
        $('#modal #save').unbind('click').click(function() {
            addCriteria(parent);
        });
        e.preventDefault();
    });

    $(document).on('click', '#criterias a.remove', function(e) {
        removeItem($(this).attr('data-criteria'), true);
        e.preventDefault();
    });

    $(document).on('click', '#criterias a.edit', function(e) {
        openModal('Edit criteria', 'Criteria');
        var id = $(this).attr('data-criteria');
        initEditForm(id);
        $('#modal #save').unbind('click').click(function() {
            editItem(id, true);
        });
        e.preventDefault();
    });

    draw();

    $(document).on('click', '.to-step', function() {
        var nextStep = $(this).attr('data-to');
        $('.step').hide();
        $('#' + nextStep).show();
        // var alternatives = getAlternatives();
        // var criterias = getCriterias();

        // if (alternatives.length < 2 || criterias.length < 2) {
        // 	alertError("There must be as minimum 2 alternatives and 2 criterias.");
        // } else {
        // 	$('.step').hide();
        // 	$('#step-2').show();
        // }
    });

    // constructTable("Criterias", "table-criterias", ['C 1', 'C 2', 'C 3', 'C 4', 'C 5', 'C 6', 'C 7'], 't');

    $(document).on('change', '.data-table select', function() {
        var table = $(this).parents('.data-table');
        var td = $(this).parents('td');
        var i = td.attr('data-i');
        var j = td.attr('data-j');
        var reverse = $(this).find('option:selected').attr('data-reverse');
        var value = $(this).val();
        td.attr('data-value', value);
        table.find('.data-table-cell[data-i=' + j + '][data-j=' + i + ']').attr('data-value', reverse).text(reverse).css({
            'background': '#f2f2f2',
            'color': '#000'
        });
        calc(table.attr('id'));
        //   td.css({'background':'#18BC9C'});
    });

    //   $('#test-table td').css({border:'1px solid #000', padding: '10px'}).each(function(){
    // 	  var i = $(this).attr('data-i');
    // 	  var j = $(this).attr('data-j');
    // 	  if (i == j) {
    // 		  $(this).css({background: 'green', 'color': '#fff'});
    // 	  }
    // 	  if (i>j) {
    // 		  $(this).css({background: 'gray', 'color': '#fff'});
    // 	  }
    // 	  $(this).text(i+" "+j);
    //   });


});