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
	$("#where").chosen({disable_search: true});

	$(".hint").popover({placement: 'bottom', trigger: 'hover'});

	$("#doclink").click(function () {
		var url = $(this).attr('url');
		$("#pdf").attr('src', url);
		$("#pdf").show();
		$(this).hide();
		return false;
	})

	$("#doc").chosen({allow_single_deselect: true}).change(function () {
		var selected = $('#doc').find(":selected");
		var filename = selected.attr('filename');
		var lang = selected.attr('lang');
		var langs = $("#langs");

		$("#pdf").attr('src', 'about:blank');
		$("#pdf").hide();
		var url = 'https://docs.google.com/gview?url=https://github.com/lobbyplag/lobbyplag-data/raw/master/raw/lobby-documents/' +
			filename
			+ '&embedded=true';
		var link = $("#doclink");
		link.html("Dokument <b>" + filename + "</b> mit Google Docs öffnen");
		link.attr('url', url);
		link.show();

		langs.val(lang);
		langs.trigger("liszt:updated");
		$('#txt_old').attr('lang', lang);
		$('#txt_new').attr('lang', lang);
		var pages = selected.attr('pages');
		var max = isNaN(pages) ? 1 : parseInt(pages);
		$(":range").data("rangeinput").setMax(max);
	});

	$(":range").rangeinput({precision: 0, keyboard: true, max: 1});

	$(".fetch-text").click(function () {
		var d = $("#directive").val();
		var lang = $("#langs").val();
		if (d) {
			$.get('/directive/', {id: d, lang: lang}, function (data) {
				$("#txt_old").val(data);
			});
		} else {
			alert('Bitte zuerst den Absatz der Direktive auswählen.')
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
