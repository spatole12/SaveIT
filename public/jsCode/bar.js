$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
    var ctx = $("#bar-chartcanvas");
    var data = {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        datasets: [{
            label: "In $",
            data: [1000, 5000, 3000, 2000, 100, 4000, 6000, 2000, 1000, 7000, 3000, 2000],
            backgroundColor: [
                "rgba(10, 20, 30, 0.3)",
                "rgba(10, 20, 30, 0.3)",
                "rgba(10, 20, 30, 0.3)",
                "rgba(10, 20, 30, 0.3)",
                "rgba(10, 20, 30, 0.3)",
                "rgba(10, 20, 30, 0.3)",
                "rgba(10, 20, 30, 0.3)",
                "rgba(10, 20, 30, 0.3)",
                "rgba(10, 20, 30, 0.3)",
                "rgba(10, 20, 30, 0.3)",
                "rgba(10, 20, 30, 0.3)",
                "rgba(10, 20, 30, 0.3)"
            ],
            borderColor: [
                "rgba(10, 20, 30, 1)",
                "rgba(10, 20, 30, 1)",
                "rgba(10, 20, 30, 1)",
                "rgba(10, 20, 30, 1)",
                "rgba(10, 20, 30, 1)",
                "rgba(10, 20, 30, 1)",
                "rgba(10, 20, 30, 1)",
                "rgba(10, 20, 30, 1)",
                "rgba(10, 20, 30, 1)",
                "rgba(10, 20, 30, 1)",
                "rgba(10, 20, 30, 1)",
                "rgba(10, 20, 30, 1)"
            ],
            borderWidth: 1
        }]
    };
    var options = {
        title: {
            display: true,
            position: "top",
            text: "Your Monthly Savings",
            fontSize: 20,
            fontColor: "#111",
            scales: {
                yAxes: [{
                    gridLines: {
                        // stacked: true,
                        color: '#aaa',
                        borderDash: [1, 3]
                    },
                        display: false
                }]
            }
        }
    };

    var chart = new Chart(ctx, {
        type: "bar",
        data: data,
        options: options
    });
});