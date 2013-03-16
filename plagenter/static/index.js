function error(msg) {
	var div = $("#status");
	div.empty().append(msg);
	div.removeClass('alert-info');
	div.addClass('alert-error');
	div.toggle(true);
}

function status(msg) {
	var div = $("#status");
	div.empty().append(msg);
	div.removeClass('alert-error');
	div.addClass('alert-info');
	div.toggle(true);
}

$(document).ready(function () {

	$("#directive").chosen({allow_single_deselect: true});

	$("#langs").chosen();

	$("#doc").chosen({allow_single_deselect: true}).change(function () {
		var selected = $('#doc').find(":selected");
		var lang = selected.attr('lang');
		var langs = $("#langs");
		langs.val(lang);
		langs.trigger("liszt:updated");
		var pages = selected.attr('pages');
		var max = isNaN(pages) ? 1 : parseInt(pages);
		$(":range").data("rangeinput").setMax(max);
	});

	$(":range").rangeinput({precision: 0, keyboard: true, max: 1});


	$(".fetch-text").click(function () {
		var d = $("#directive").val();
		var lang = $("#langs").val();
		if (d) {
			$.get('/directive/', {id: d, lang:lang}, function (data) {
				$("#txt_old").val(data);
			});
		}
		return false;
	});

	$(".clear-text").click(function () {
		var text_id = $(this).attr('for');
		$("#" + text_id).val('');
		return false;
	});

	$("#datalove").submit(function (event) {
		event.preventDefault();
		var postdata = $(this).serialize();
		var posting = $.post('/', postdata);
		posting.done(function (data) {
			if (data.indexOf('OK') !== 0)
				error(data);
			else
				status(data);
		}).fail(function () {
				error('Sorry, an error occurred. :.(');
			});
	});
});
