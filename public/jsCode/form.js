(function () {

    const staticForm = document.getElementById("static-form");

    if (staticForm) {
        // We can store references to our elements; it's better to
        // store them once rather than re-query the DOM traversal each time
        // that the event runs.
        const username = document.getElementsByName("username")[0];
        const password = document.getElementsByName("password")[0];
        const email = document.getElementsByName("email")[0];
        // We can take advantage of functional scoping; our event listener has access to its outer functional scope
        // This means that these variables are accessible in our callback
        staticForm.addEventListener("submit", event => {
            event.preventDefault();

            try {
                // hide containers by default



                // Values come from inputs as strings, no matter what :(
                let usernameval = username.value;
                let passwordval = password.value;
                let emailval = email.value;
                var data = {
                    "username": usernameval,
                    "password": passwordval,
                    "email": emailval,
                };
                $.ajax({
                    type: 'POST',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    url: 'http://localhost:4000/users',
                    success: function (data) {
                        window.location.replace("http://localhost:4000/goals");
                    }
                });
            } catch (e) {
                const message = typeof e === "string" ? e : e.message;
                errorTextElement.textContent = e;
                $(errorContainer).css("visibility", "visible");
            }
        });
    }
})();