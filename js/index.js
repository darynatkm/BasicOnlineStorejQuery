const chance = new Chance();
const urlReg = "https://fakestoreapi.com/users";
const urlLogin = "https://fakestoreapi.com/auth/login";
const urlProducts = "https://fakestoreapi.com/products";
const urlCart = 'https://fakestoreapi.com/carts';
let cartItems = JSON.parse(sessionStorage.getItem("cartItems")) || [];
let subtotalPrice = 0;
function checkAuth() {
    let isAuth = !!localStorage.getItem("token");
    if (isAuth) {
        $("#auth").addClass("none")
        $("#store").removeClass("none")
        getProducts();
    } else {
        $("#auth").removeClass("none")
        $("#store").addClass("none")
        $(".buttons").removeClass("none")
        // updateCart()
    }
}

checkAuth();


$("#gen").click(
    () => {
        $("#email").val(chance.email());
        $("#username").val(chance.string({ length: 6, alpha: true }));
        $("#password").val(chance.string({ length: 8, pool: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()[]" }));
    }
)

$("#authForm").submit(
    (e) => {
        $("#loader").removeClass("none")
        e.preventDefault();
        const body = {
            email: $("#email").val(),
            username: $("#username").val(),
            password: $("#password").val(),
        }
        reg(body);
        log({
            username: "mor_2314",
            password: "83r5^_"
        });
    }
)

function reg(body) {
    console.log(body)
    $.ajax({
        url: urlReg,
        method: 'post',
        data: body
    })
        .done(function (response) {
            localStorage.setItem("id", response.id)
        })
        .fail(function () {
            console.log("error")
        })
        .always(function () {
            console.log("complete")
        });
}

function log(body) {

    $.ajax({
        url: urlLogin,
        method: 'post',
        data: body
    })
        .done(function (response) {
            localStorage.setItem("token", response.token);
            checkAuth();

        })
        .fail(function () {
            console.log("error")
        })
        .always(function () {
            $("#loader").addClass("none")
        });
}

$("#logout").click(
    () => {
        localStorage.removeItem("token")
        localStorage.removeItem("id")
        checkAuth();
    }
)

function getProducts() {
    $.ajax({
        url: urlProducts,

    })
        .done(function (response) {
            console.log(response)
            response.map(item => {
                $("#products").append(`<div class="card p-3">
                <img src=${item.image} class="card-img-top img-fluid rounded-3" alt="...">
                <div class="card-body">
                  <h5 class="card-title">${item.title}</h5>
                  <strong><p class="productPrice text-danger font-weight-bold">$${item.price}</p></strong>
                  <p onclick="showMore(this)" class="card-text line-clamp-4">${item.description}</p>
                  <button class="btn btn-primary" onClick="getProductByID(${item.id})">Show more</button>
                </div>
              </div>`)
            }
            )
        })
        .fail(function () {
            console.log("error")
        })
        .always(function () {
            console.log("complete")
        });
}

function getProductByID(id) {
    console.log(id)

    $.ajax({
        url: urlProducts + "/" + id,

    })
        .done(function (response) {
            console.log(response)
            $("#return").show();
            $("#products").empty();
            $("#products").addClass("products-wrap-page")
            $("#products").removeClass("products-wrap row row-cols-1 row-cols-sm-2 row-cols-md-4 d-flex justify-content-center")
            $("#products").append(`<div class="card d-flex flex-row" style="
            gap: 20px;">
            <img src=${response.image} class="card-img-top w-50" alt="...">
            <div class="card-body mt-5">
              <h5 class="card-title" >${response.title}</h5>
              <p class="card-category">Category: ${response.category}</p>   
              <strong><p class="card-price text-danger">$${response.price}</p></strong>   
              <p class="card-rate">Rate: ${response.rating.rate}</p>   
              <p class="card-count">Reviews: ${response.rating.count}</p>              
              <p class="card-text">${response.description}</p>
              <div class=" d-flex qtyBlock" style="gap: 10px">
              <div>Quantity : </div><input min="1" max="99" class="qtyInput" type="number">
              </div>
              <button class="btn btn-primary" onClick="addToCart(${response.id}, $(this).prev().find('input').val())">Add To Cart</button>
                          
            </div>
          </div>`)
          $(".qtyInput").val("1")

        })
        .fail(function () {
            console.log("error")
        })
        .always(function () {
            console.log("complete")
        });
}

// show more text in the product catalog 
const showMore = (event) => {
    console.log(event)
    event.classList.remove("line-clamp-4");
}
const addToCart = (id, qty) => {

    let todayDate = new Date();
    cartItems.push({"productId":id, "quantity":qty}); 

    
    $.ajax({
        url: urlCart,
        method: 'post',
        data: JSON.stringify(
            {
                userId:localStorage.getItem("id"),
                date:todayDate,
                products: cartItems
            }
        )

    })
    .done(function (response) {
        sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
        updateCart()
    })
    .fail(function () {
        console.log("error")
    })
    .always(function () {
        console.log("complete")
    });  
} 


const updateCart = () => {

    $("#countCart").html(cartItems.length)

}

const fetchCart = () => {


    $.ajax({
        url: urlCart + "/user/" + localStorage.getItem("id"),

    })
    .done(function (response) {
        $("#cartItemsBlock").empty()
        subtotalPrice = 0
        JSON.parse(sessionStorage.getItem("cartItems")).map(
            item => {
                $.ajax({
                    url: urlProducts + "/" + item.productId,
            
                })
                    .done(function (response) {
                        console.log(response)
                        $("#cartItemsBlock").append(`
                        <div class="card rounded-3 mb-4">
                            <div class="card-body p-4">
                                <div class="row d-flex justify-content-between align-items-center">
                                    <div class="col-md-2 col-lg-2 col-xl-2">
                                    <img
                                        src="${response.image}"
                                        class="img-fluid rounded-3" alt="product">
                                    </div>
                                        <div class="col-md-3 col-lg-3 col-xl-3">
                                        <p class="fw-normal mb-2">${response.title}</p>
                                    </div>
                                    <div class="col-md-3 col-lg-3 col-xl-2 d-flex">
                                
                                        <input id="form1" min="0" class="itemQties w-50" name="quantity" value="${item.quantity}" type="number"
                                            class="form-control form-control-sm" />
                                    </div>
                                    <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                                        <h6 class="mb-0 itemPrices">${response.price}</h6>
                                    </div>
                                </div>
                            </div>
                      </div>`)
                      subtotalPrice += response.price * item.quantity
                      $("#totalPrice").html(`$ ${subtotalPrice}`)
                    })
                    .fail(function () {
                        console.log("error")
                    })
                    .always(function () {
                        console.log("complete")
                    });
            }
        )
    })
    .fail(function () {
        console.log("error")
    })
    .always(function () {
        console.log("complete")
    });  

} 
updateCart();

