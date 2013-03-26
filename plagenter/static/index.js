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

function directiveSelection(offset) {
	var directive = $("#directive");
	var index = directive.prop("selectedIndex");
	index = Math.max(index + offset, 0);
	$('#directive option').eq(index).attr('selected', 'selected');
	directive.chosen().change();
	directive.trigger("liszt:updated");
}

function displayDocInfos(name, lang, filename) {
	var pdf = $("#pdf");
	pdf.attr('src', 'about:blank');
	pdf.hide();
	var url = 'https://docs.google.com/gview?url=https://github.com/lobbyplag/lobbyplag-data/raw/master/raw/lobby-documents/' +
		filename
		+ '&embedded=true';
	$("#docname").text(name);
	$("#docgooglelink").attr('url', url);
	$("#doclink").attr('url', '/pdfobject/' + filename);
	$("#docpdflink").attr('url', '/pdf/' + filename);
	$("#docinfo").show();
}

function docChange() {
	var selected = $('#doc').find(":selected");
	var filename = selected.attr('filename');
	if (!filename) {
		$("#docinfo").hide();
		$("#pdf").hide();
	} else {
		var lang = selected.attr('lang');
		var langs = $("#langs");
		displayDocInfos(selected.text(), lang, filename);
		langs.val(lang);
		langs.trigger("liszt:updated");
		$('#txt_old').attr('lang', lang);
		$('#txt_new').attr('lang', lang);
		var pages = selected.attr('pages');
		var max = isNaN(pages) ? 1 : parseInt(pages);
		$(":range").data("rangeinput").setMax(max);
	}
}

function setupKeyCommands() {
	shortcut.add("ctrl+S", function () {
		$("#datalove").submit();
	});
	shortcut.add("ctrl+D", function () {
		fetchText();
		return false;
	});
	shortcut.add("ctrl+L", function () {
		$('#txt_old').val('');
		$('#txt_new').val('');
		return false;
	});
	shortcut.add("ctrl+alt+left", function () {
		$('#txt_old').val('');
		return false;
	});
	shortcut.add("ctrl+alt+right", function () {
		$('#txt_new').val('');
		return false;
	});
	shortcut.add("ctrl+right", function () {
		$(":range").data("rangeinput").step(1);
		return false;
	});
	shortcut.add("ctrl+left", function () {
		$(":range").data("rangeinput").step(-1);
		return false;
	});
	shortcut.add("ctrl+down", function () {
		directiveSelection(1);
		return false;
	});
	shortcut.add("ctrl+alt+down", function () {
		directiveSelection(10);
		return false;
	});
	shortcut.add("ctrl+up", function () {
		directiveSelection(-1);
		return false;
	});
	shortcut.add("ctrl+alt+up", function () {
		directiveSelection(-10);
		return false;
	});
	shortcut.add("alt+1", function () {
		$("#doc" + "_chzn").trigger('mousedown');
		return false;
	});
	shortcut.add("alt+2", function () {
		$("#pagenr").focus();
		return false;
	});
	shortcut.add("alt+3", function () {
		$("#directive" + "_chzn").trigger('mousedown');
		return false;
	});
	shortcut.add("alt+4", function () {
		$("#where" + "_chzn").trigger('mousedown');
		return false;
	});
	shortcut.add("alt+5", function () {
		$("#what" + "_chzn").trigger('mousedown');
		return false;
	});
	shortcut.add("alt+6", function () {
		$("#txt_old").focus();
		return false;
	});
	shortcut.add("alt+7", function () {
		$("#txt_new").focus();
		return false;
	});
}

function openPDF(url) {
	var pdf = $("#pdf");
	pdf.attr('src', url);
	pdf.show();
	$("#docinfo").hide();
}

function tooltip(msg, element) {
	element.tooltip({
		title: msg,
		placement: 'bottom',
		animation: false,
		trigger: 'focus'
	});
	element.tooltip('show');
}

function fetchText() {
	var d = $("#directive").val();
	var lang = $("#langs").val();
	if (d) {
		$.get('/directive/', {id: d, lang: lang}, function (data) {
			$("#txt_old").val(data);
		});
	} else {
		tooltip('Bitte Absatz der Direktive auswählen.', $("#directive" + "_chzn"))
	}
	return false;
}

function submit(event) {
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
}

function clean(textarea) {
	var text = textarea.val();
	//line breaks zu spaces
	text = text.replace(/(\r\n|\n|\r)/gm, " ");
	//multi whitespace zu single space
	text = text.replace(/\s+/g, " ");
	textarea.val(text);
}

function resizeContent() {
	var space = 8;
	var height = $("#header").height() + space;
	var middlehead = $(".middlehead");
	middlehead.css('top', height);
	height += middlehead.height();
	var middle = $(".middle");
	middle.css('top', height);
	height += middle.height() + space;
	$(".bottom").css('top', height);
}

$(document).ready(function () {
	$("#directive").chosen({allow_single_deselect: true}).change(function () {
		$("#directive" + "_chzn").tooltip('hide');
	});
	$("#langs").chosen();
	$("#where").chosen({disable_search: true});
	$("#what").chosen({disable_search: true});
	$(".hint").popover({placement: 'bottom', trigger: 'hover', html: true});
	$(".doclinks").click(function () {
		openPDF($(this).attr('url'));
		return false;
	});
	$("#doc").chosen({allow_single_deselect: true}).change(docChange);
	$(":range").rangeinput({precision: 0, keyboard: true, max: 1});
	$("#fetch-text").click(fetchText);


	$(".clean-text").click(function () {
		clean($("#" + $(this).attr('for')));
		return false;
	});

	$(".clear-text").click(function () {
		$("#" + $(this).attr('for')).val('');
		return false;
	});

	$("#datalove").submit(submit);

	$(".chzn-results").attr('tabindex', -1);
	$(".handle").attr('tabindex', -1);
	docChange();
	setupKeyCommands();
	resizeContent();

	$(window).resize(function () {
		resizeContent();
	});
});
