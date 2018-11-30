
function openForm() {
    document.getElementById("myForm").style.display = "inline-block";
}
handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });
function closeForm() {
    document.getElementById("myForm").style.display = "none";
}
function openForm2() {
    document.getElementById("myForm2").style.display = "block";
}

function closeForm2() {
    document.getElementById("myForm2").style.display = "none";
}

function deleteTab(ele_del){

    let ele_id = ele_del.value;
   // return ele_id;
    $.ajax({
        type:'delete',
        url:'http://localhost:4000/goals/' + ele_id,
          success : function() {
            console.log('success');
            window.location.replace("http://localhost:4000/goals");
         },
        error : function() {
          console.log('error');
  
        }
      })
}
function checkvalue(gvalue){

    if(gvalue=="Other")
    {
        document.getElementById("othergoal").style.display = "block";
    }
    else{
        document.getElementById("othergoal").style.display = "none";
    }
}
function EditTab(ele_edit){

    let ele_id = ele_edit.value;
   // return ele_id;
    $.ajax({
        type:'get',
        url:'http://localhost:4000/goals/edit/'+ele_id,
          success : function() {
            console.log('success');
            window.location.replace("http://localhost:4000/goals");
         },
        error : function() {
          console.log('error');
  
        }
      })
}




function openForm3() {
    document.getElementById("myForm3").style.display = "block";
}

function closeForm3() {
    document.getElementById("myForm3").style.display = "none";
}
function openForm5() {
    document.getElementById("myForm5").style.display = "block";
}
function closeForm5() {
    document.getElementById("myForm5").style.display = "none";
}



// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener('click', function (ev) {
    if (ev.target.tagName === 'LI') {
        ev.target.classList.toggle('checked');
    }
}, false);

// Create a new list item when clicking on the "Add" button
function newElement() {
    // var li = document.createElement("li");
    // var l_strName = String(document.getElementsByName("goalText")) ;
    // console.log(l_strName);
    // var l_numInitialAmount = Number(document.getElementsByName("goalamountText")) ;
    // var l_numMinimumAmount = Number(document.getElementsByName("goalinitialText")) ;
    console.log(document.getElementById("myForm4"));
    var li = "<div class='col-sm-3'><div class='goalList'><li>" + document.getElementsById("myForm4").value + "</li><div class='progress'><div class='progress-bar' role='progressbar' aria-valuenow='70' aria-valuemin='0' aria-valuemax='100' style='width:20%'> 20%</div></div></div></div>";
    // var inputValue = document.getElementById("myInput").value;
    // var t = document.createTextNode(inputValue);
    // li.appendChild(t);
    // if (inputValue === '') {
    // alert("You must write something!");
    // } else {
    // document.getElementById("myUL1").appendChild(li);
    // }
    // document.getElementById("myInput").value = "";

    // var span = document.createElement("SPAN");
    // var txt = document.createTextNode("\u00D7");
    // span.className = "close";
    // span.appendChild(txt);
    // li.appendChild(span);
    // if(l_strName&&l_numInitialAmount&&l_numMinimumAmount)
    $(abc).prepend(li);
    // for (i = 0; i < close.length; i++) {
    //   close[i].onclick = function () {
    //     var div = this.parentElement;
    //     div.style.display = "none";
    //   }
    // }
}

//==============================================================================================

