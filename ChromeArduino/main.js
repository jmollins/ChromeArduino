$(document).ready(function () {


    var myPort = '/dev/ttyUSB0';
    var data = [];
    var stringReceived = '';
    var connectionId;
    var startTime = Date.now();
    var runData;

    var plotOptions = {
        xaxis: {
            axisLabel: "Time (s)",
            ticks: 10,
            tickDecimals: 1
        },
        yaxis: {
            axisLabel: "Temperature (C)",
            ticks: 5,
			min: 10,
			max: 30,
			tickDecimals: 1
        }
    };

    function onConnect(connectionInfo) {
      //this.connectionId = connectionInfo.connectionId;
        connectionId = connectionInfo.connectionId;
        chrome.serial.onReceive.addListener(onReceiveCallback);

        console.log("Connected");
    }

    function ab2str(buf) {
        var bufView = new Uint8Array(buf);
        var encodedString = String.fromCharCode.apply(null, bufView);
        return decodeURIComponent(escape(encodedString));
    }

    function str2ab(str) {
        var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (i = 0; i < str.length; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    function writeSerial(str) {
        chrome.serial.send(connectionId, str2ab(str), onSend);
    }

    function onSend(bytesSent) {
        console.log("Sent" + bytesSent);
    }
    function dataReceived(data) {
        var re = new RegExp("(<)(.*)(>)");
        var temp = re.exec(data)[2];
        console.log('temp function: ' + temp);
        return temp;
    }

    function onReceiveCallback(info) {
        //console.log(info.data);
        if (info.data) {
            var str = ab2str(info.data);
            console.log(str.length);
            if (str.charAt(str.length - 1) === '\n') {

                stringReceived += str.substring(0, str.length - 1);
                console.log(stringReceived);
                //var dataList = document.createElement('li');
                var dataPoint = dataReceived(stringReceived);

                $("#dataTable").append("<li>" + dataPoint + "</li>");
                plotData(parseFloat(dataPoint));


                stringReceived = '';
            }
            else {
                stringReceived += str;
            }
        }
    }

    function plotData(myDataPoint) {
        var dataTime = Date.now();

        var timeElapsed = (dataTime - startTime) / 1000;
        console.log("Data point: ", myDataPoint);
        data.push([timeElapsed, myDataPoint]);
        if (data.length>5) {
            data.shift(); //make scrolling display
        }
        $.plot("#plot",[data], plotOptions);
    }

    function arduinoData() {
        this.dataPoints = 10;
        this.data = [];
    }

     $('#readData').off("click").on("click",function (){
         console.log("Click");
            if ($("#readData").hasClass("uk-button-success")) {
                $("#readData").removeClass("uk-button-success").addClass("uk-button-danger").html("Stop Data");
                var readDelay = $("#readDelay").val();
                console.log(readDelay);
                runData = window.setInterval(function(){writeSerial('r');}, readDelay*1000);
                console.log("Run!");
                return;
            }
            else {
                $("#readData").removeClass("uk-button-danger").addClass("uk-button-success").html("Read Data");
                clearInterval(runData);
                console.log("Stopped");
            }
    });

    $("#readDelay").on('input', function(){$("#readDelayValue").html($(this).val());
                                         console.log("slider");
                                         });


    //Start Program
    $.plot("#plot", [data], plotOptions);
    $("#readDelayValue").html($("#readDelay").val());
    chrome.serial.connect(myPort, {bitrate: 9600}, onConnect);







});
