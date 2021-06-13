$(document).ready(function() {
  $("input[type=checkbox]").click(function() {
    var $count = $("input[type=checkbox]:checked").length;
    var $not = $("input[type=checkbox]").not(":checked");

    if ($count >= 1) {
      $not.attr("disabled", true);
      $("input[type=submit]").attr("disabled", false);
    } else {
      $not.attr("disabled", false);
      $("input[type=submit]").attr("disabled", true);
    }
  });
});
