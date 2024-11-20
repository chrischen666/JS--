// console.log(token);
// console.log(api_path);
const productWrap = document.querySelector('.productWrap');
let productData = [];
//得到產品資料
function getProductList() {
    axios.get('https://livejs-api.hexschool.io/api/livejs/v1/customer/chrischen/products')
        .then(res => {
            productData = res.data.products;
            renderProductList();
        })
        .catch(error => {
            console.log(error);
        })
}
//初始化
function init() {
    getProductList();
    getCartList();
}
init();
//渲染產品清單
function renderProductList() {
    let str = ``;
    productData.forEach(product => {
        str += comboProductList(product);
    })

    productWrap.innerHTML = str;
}
//合併產品清單
function comboProductList(product) {
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img
        src="${product.images}"
        alt="product"
    />
    <a href="#" class="addCardBtn" data-id='${product.id}'>加入購物車</a>
    <h3>${product.title}</h3>
    <del class="originPrice">NT$${toThousands(product.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(product.price)}</p>
</li>`
}
//篩選產品資料
const productSelect = document.querySelector('.productSelect');
productSelect.addEventListener('change', (e) => {
    filterProductList(e);
})
function filterProductList(e) {
    const category = e.target.value;
    if (category === '全部') {
        renderProductList()
        return
    }
    else {
        let str = '';
        productData.forEach(product => {
            if (product.category === category) {
                str += comboProductList(product)
            }
        })
        productWrap.innerHTML = str;
    }
}

//得到購物車資料
let cartData = [];
const cartTotal = document.querySelector('.cart-total');
function getCartList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then((response) => {
            cartTotal.textContent = toThousands(response.data.finalTotal);
            cartData = response.data.carts;
            renderCartList();
        })
        .catch(error => {
            console.log(error);
        })
}
//加入購物車
//監聽都寫在外層
productWrap.addEventListener('click', (e) => {
    const addCardClass = e.target.getAttribute('class');
    const productId = e.target.getAttribute('data-id');
    e.preventDefault();
    if (addCardClass !== 'addCardBtn') {
        alert('沒點擊到購物車');
        return
    }
    let numCheck = 1;
    cartData.forEach(cart => {
        if (cart.product.id === productId) {
            numCheck = cart.quantity += 1;
        }
    })
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
        "data": {
            "productId": productId,
            "quantity": numCheck
        }
    })
        .then(() => {
            getCartList();
        })
        .catch(error => {
            console.log(error);
        })
})
//渲染購物車資料
const shoppingCartTable = document.querySelector('.shoppingCart-table');
const shoppingCartTbody = document.querySelector('.shoppingCart-tbody');
function renderCartList() {
    let str = '';
    cartData.forEach(cart => {
        str += `
            <tr>
                        <td>
                            <div class="cardItem-title">
                                <img
                                    src='${cart.product.images}'
                                    alt="cart"
                                />
                                <p>${cart.product.title}</p>
                            </div>
                        </td>
                        <td>NT${toThousands(cart.product.price)}</td>
                        <td>${cart.quantity}</td>
                        <td>NT$${toThousands(cart.product.price * cart.quantity)}</td>
                        <td class="discardBtn">
                            <a href="#" class="material-icons" data-id='${cart.id}'> clear </a>
                        </td>
                    </tr>
        `
    })
    shoppingCartTbody.innerHTML = str;
}
//刪除購物車產品
shoppingCartTbody.addEventListener('click', (e) => {
    e.preventDefault();
    const cartId = e.target.getAttribute('data-id');
    if (cartId === null) {
        alert('沒點擊到刪除');
        return
    }
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`, {
    })
        .then(res => {
            getCartList();
        })
        .catch(error => {
            console.log(error);
        })
})

//刪除購物車所有品項成功
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', (e) => {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    })
        .then(res => {
            alert('刪除購物車所有品項成功')
            getCartList();
        })
        .catch(error => {
            alert('購物車已清空請勿重複點擊')
            console.log(error);
        })
})

//送出訂單
const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    //獲取字串的方法
    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const tradeWay = document.querySelector('#tradeWay').value;
    if (cartData.length <= 0) {
        alert('請先加入購物車');
        return
    }
    else {
        if (customerName == '' || customerPhone == '' || customerEmail == '' || customerAddress == '' || tradeWay == '') {
            alert('訂單欄位不得為空白');
            return
        }
        else {
            axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
                "data": {
                    "user": {
                        "name": customerName,
                        "tel": customerPhone,
                        "email": customerEmail,
                        "address": customerAddress,
                        "payment": tradeWay
                    }
                }
            })
                .then(response => {
                    alert('訂單新增成功');
                    document.querySelector('#customerName').value = '';
                    document.querySelector('#customerPhone').value = '';
                    document.querySelector('#customerEmail').value = '';
                    document.querySelector('#customerAddress').value = '';
                    document.querySelector('#tradeWay').value = 'ATM';
                    getCartList();
                })
                .catch(error => {
                    console.log(error);
                })
        }
    }
}
)

//計算千分位
function toThousands(x) {
    let parts = x.toString().split("."); // 將數字轉為字串，並拆分為整數與小數部分
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 格式化整數部分
    return parts.join("."); // 組合回整數與小數部分
}


//表單驗證
const inputs = document.querySelectorAll("input[name],select[data-payment]");
const form = document.querySelector(".orderInfo-form");
const constraints = {
    "姓名": {
        presence: {
            message: "必填欄位"
        }
    },
    "電話": {
        presence: {
            message: "必填欄位"
        },
        length: {
            minimum: 8,
            message: "需超過 8 碼"
        }
    },
    "信箱": {
        presence: {
            message: "必填欄位"
        },
        email: {
            message: "格式錯誤"
        }
    },
    "寄送地址": {
        presence: {
            message: "必填欄位"
        }
    },
    "交易方式": {
        presence: {
            message: "必填欄位"
        }
    },
};


//表單驗證方法
inputs.forEach((item) => {
    item.addEventListener("change", () => {
        item.nextElementSibling.textContent = '';
        let errors = validate(form, constraints) || '';
        if (errors) {
            Object.keys(errors).forEach((keys) => {
                // console.log(document.querySelector(`[data-message=${keys}]`))
                document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
            })
        }
    });
});
