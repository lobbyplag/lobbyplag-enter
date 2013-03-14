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
	$(".combobox").chosen({allow_single_deselect: true});

	$(".fetch-text").click(function () {
		var d = $("#directive").val();
		$.get('/directive/', {id: d}, function (data) {
			$("#txt_old").val(data);
		});
	});


	$(".clear-text").click(function () {
		var text_id = $(this).attr('for');
		$("#" + text_id).val('');
	});

	$("#datalove").submit(function (event) {
		event.preventDefault();
		var postdata = $(this).serialize();
		var posting = $.post('/', postdata);
		posting.done(function (data) {
			if (data.indexOf('OK') !== 0)
				error(data)
			else
				status(data);
		}).fail(function () {
				error('Sorry, an error occurred. :.(');
			});
	});
});
