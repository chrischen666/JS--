// 預設 JS，請同學不要修改此處
let menuOpenBtn = document.querySelector('.menuToggle');
let linkBtn = document.querySelectorAll('.topBar-menu a');
let menu = document.querySelector('.topBar-menu');
menuOpenBtn.addEventListener('click', menuToggle);

linkBtn.forEach((item) => {
    item.addEventListener('click', closeMenu);
})

function menuToggle() {
    if (menu.classList.contains('openMenu')) {
        menu.classList.remove('openMenu');
    } else {
        menu.classList.add('openMenu');
    }
}
function closeMenu() {
    menu.classList.remove('openMenu');
}

// 抓到訂單資料
let orderList = [];
function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token
        }
    })
        .then(response => {
            orderList = response.data.orders;
            renderOrderList();
            // renderC3();
            renderC3_lv2();
        })
        .catch(error => {
            console.log(error);
        })
}
// 初始化
function init() {
    getOrderList();
}
init();
const orderPageTable = document.querySelector('.orderPage-table');
const orderPageTbody = document.querySelector('.orderPage-tbody');
//渲染訂單
function renderOrderList() {
    let str = '';
    orderList.forEach(order => {
        let orderStr = '';
        //組產品數量字串
        order.products.forEach(orderProduct => {
            orderStr += `<p>${orderProduct.title}X${orderProduct.quantity}</p>`;
        })
        //組訂單日期字串
        const timeStamp = new Date(order.createdAt * 1000);
        const orderCreateDate = timeStamp.getFullYear() + '/' + (timeStamp.getMonth() + 1) + '/' + timeStamp.getDate()
        //訂單狀態處理
        const orderPaid = order.paid ? '未處理' : '已處理';
        //組訂單字串
        str += `  <tr>
                            <td>${order.id}</td>
                            <td>
                                <p>${order.user.name}</p>
                                <p>${order.user.tel}</p>
                            </td>
                            <td>${order.user.address}</td>
                            <td>${order.user.email}</td>
                            <td>
                                <p>${orderStr}</p>
                            </td>
                            <td>${orderCreateDate}</td>
                            <td >
                                <a href="#" class="orderStatus" data-status='${order.paid}' data-id='${order.id}'>${orderPaid}</a>
                            </td>
                            <td>
                                <input
                                    data-id='${order.id}'
                                    type="button"
                                    class="delSingleOrder-Btn"
                                    value="刪除"
                                />
                            </td>
                        </tr>`
    })
    orderPageTbody.innerHTML = str;
}
orderPageTable.addEventListener('click', (e) => {
    e.preventDefault();
    const targetClass = e.target.getAttribute('class')
    const id = e.target.getAttribute('data-id');
    const status = e.target.getAttribute('data-status');
    if (targetClass === 'orderStatus') {
        changeOrderStatus(id, status);
        return
    }
    else if (targetClass === 'delSingleOrder-Btn') {
        delOrderList(id);
        return
    }
})

//刪除單筆訂單
function delOrderList(id) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`, {
        headers: {
            'Authorization': token
        }
    })
        .then(response => {
            orderList = response.data.orders;
            getOrderList();
        })
        .catch(error => {
            console.log(error);
        })
}
//切換訂單狀態
function changeOrderStatus(id, status) {
    let newStatus;
    if (status === 'true') {
        newStatus = false
    }
    else {
        newStatus = true
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        "data": {
            "id": id,
            "paid": newStatus
        }
    }, {
        headers: {
            'Authorization': token
        }
    })
        .then(response => {
            orderList = response.data.orders;
            getOrderList();
        })
        .catch(error => {
            console.log(error);
        })
}

//清除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', (e) => {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token
        }
    })
        .then(response => {
            orderList = response.data.orders;
            getOrderList();
        })
        .catch(error => {
            console.log(error);
        })
})

// C3圖表渲染
// function renderC3() {
//     let newData = [];
//     let obj = {};
//     orderList.forEach(order => {
//         order.products.forEach(product => {
//             if (obj[product.title]) {
//                 obj[product.title] += product.price * product.quantity;
//             }
//             else {
//                 obj[product.title] = product.price * product.quantity
//             }
//         })
//     })
//     console.log(obj);
//     newData = Object.entries(obj);
//     console.log(newData);
//     let chart = c3.generate({
//         bindto: '#chart', // HTML 元素綁定
//         data: {
//             type: "pie",
//             columns: newData,
//         },
//     });
// }

//C3圖表排序渲染
function renderC3_lv2() {
    let newData = [];
    let obj = {};
    orderList.forEach(order => {
        order.products.forEach(product => {
            if (obj[product.title]) {
                obj[product.title] += product.price * product.quantity;
            }
            else {
                obj[product.title] = product.price * product.quantity
            }
        })
    })
    newData = Object.entries(obj);
    newData.sort((a, b) => {
        return b[1] - a[1]
    })
    if (newData.length > 3) {
        let totalOrder = 0;
        newData.forEach((product, index) => {
            if (index > 2) {
                totalOrder += product[1];
            }
        })
        newData.splice(3);
        let arr = [];
        arr.push('其他');
        arr.push(totalOrder);
        newData.push(arr);
    }
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        color: {
            pattern: ['#DACBFF', '#9D7FEA', '#5434A7', '#301E5F']
        },
        data: {
            type: "pie",
            columns: newData,
        },
    });
}

