$(".Details_button").click(function(){
    if($(".Details_area").attr("hidden")){
        $(".Details_area").removeAttr("hidden")
        $(".Details_button_up").prop("hidden", true);
        $(".Details_button_down").prop("hidden", false);
    } else {
        $(".Details_area").prop("hidden", true);
        $(".Details_button_up").prop("hidden", false);
        $(".Details_button_down").prop("hidden", true);
    }


})