/*
    let frame = {
        id: -1,
        name: null,
        amount: 0,
        amountPaid: 0,
        lastAmountPaid: 0,
        datePaid: null,
        lastDate: null,
        status: false
    };
*/

const listElement = document.getElementById("listData"),
    addForm = document.getElementById("addForm");

Date.prototype.toDateInputValue = function () {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
};

if (addForm !== null) {
    addForm.addEventListener("submit", function (e) {
        e.preventDefault();
        let name = document.getElementById('name').value,
            amount = document.getElementById('amount').value,
            amountPaid = document.getElementById('amountPaid').value,
            lastAmountPaid = document.getElementById('lastAmountPaid').value,
            datePaid = document.getElementById('datePaid').value,
            lastDate = document.getElementById('lastDate').value,
            type = document.getElementById('type').value == 1 ? true : false;

        if (name.length < 1) {
            showError("Lütfen geçerli bir isim girin.");
            return;
        }
        if (amount <= 0) {
            showError("Lütfen geçerli bir borç tutarı girin.");
            return;
        }
        if (amountPaid < 0) {
            showError("Lütfen geçerli bir ödenen miktar girin.");
            return;
        }

        if (amountPaid > amount) {
            showError("Ödenen miktar borç tutarından yüksek olamaz.");
            return;
        }

        if (lastAmountPaid > amount) {
            showError("Son ödenen miktar borç tutarından yüksek olamaz.");
            return;
        }

        if (lastAmountPaid > amountPaid) {
            showError("Son ödenen miktar toplam ödenen miktardan daha yüksek olamaz.");
            return;
        }

        if (datePaid.length < 1) {
            showError("Lütfen geçerli bir en son ödenen tarih değeri girin.");
            return;
        }

        if (lastDate.length < 1) {
            showError("Lütfen geçerli bir son ödeme tarihi değeri girin.");
            return;
        }

        addList(name, amount, amountPaid, lastAmountPaid, datePaid, lastDate, type);
        Swal.fire(
            'Başarılı!',
            'Borç başarıyla eklendi!',
            'success'
        );
        this.reset();
    })
}


function updateStats() {
    let data = getData();
    let amount1 = 0,
    amount2 = 0,
    count1 = 0,
    count2 = 0;
    data.forEach(function(item, index){
        if(item.type){
            amount1 += parseInt(item.amount);
            count1++;
        } else {
            amount2 += parseInt(item.amount);
            count2++;
        }
    });

    document.getElementById("counter5").innerText = data.length;
    document.getElementById("counter6").innerText = (amount1 + amount2) + " [₺]";
    document.getElementById("counter1").innerText = count1;
    document.getElementById("counter2").innerText = count2;
    document.getElementById("counter3").innerText = amount2 + " [₺]";
    document.getElementById("counter4").innerText = amount1 + " [₺]";
}

function showError(text) {
    Swal.fire(
        'Hata!',
        text,
        'error'
    );
}

function listData() {
    let veriables = getData();
    listElement.innerHTML = "";
    veriables.forEach(function (item, index) {
        let percent = (item.amountPaid / item.amount) * 100;
        percent = 100.00 - percent.toFixed(2);
        let buttons = `
    <button type="button" class="btn btn-sm btn-inverse-info" onclick="editData(${index});">Düzenle</button>
    <button type="button" onclick="deleteData(this);" class="btn btn-sm btn-inverse-danger">Sil</button>
    `;
        if (!item.type) {
            buttons = `
        <button type="button" class="btn btn-sm btn-inverse-primary" onclick="paid(${index});">Öde</button> 
        <button type="button" class="btn btn-sm btn-inverse-info" onclick="editData(${index});">Düzenle</button>
        <button type="button" onclick="deleteData(this);" class="btn btn-sm btn-inverse-danger">Sil</button>`
        }
        listElement.innerHTML += `<tr data-id = "${item.id}">
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.amount} [₺]</td>
                <td>${item.amountPaid} [₺]</td>
                <td class="text-${item.type ? 'success' : 'danger'}"> ${percent}% <i class="mdi mdi-arrow-${item.type ? 'down' : 'up'}"></i> ${item.amount - item.amountPaid} [₺]</td>
                <td>${item.lastAmountPaid} [₺]</td>
                <td>${item.datePaid}</td>
                <td>${item.lastDate}</td>
                <td>${item.type ? '<label class="badge badge-success">Verilen Borç</label>' : '<label class="badge badge-danger">Alınan Borç</label>'}</td>
                <td>${buttons}</td>
              </tr>`
    })
}


function deleteData(element) {
    let remove = element.parentNode.parentNode;
    Swal.fire({
        title: 'Emin misiniz?',
        text: "Bu işlemi geri alamazsınız!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Evet, silmek istiyorum!',
        cancelButtonText: "İptal"
    }).then((result) => {
        if (result.isConfirmed) {
            removeList(remove.dataset.id);
            listData();
            Swal.fire(
                'Başarılı!',
                'Borç başarıyla silindi.',
                'success'
            )
        }
    })
}

function paid(index) {
    let _data = getData(),
        data = _data[index];

    Swal.fire({
        title: 'Ödenecek tutarı girin',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        cancelButtonText: "İptal",
        confirmButtonText: 'Öde',
        showLoaderOnConfirm: true,
        preConfirm: (amount) => {
            if (amount <= 0) {
                Swal.showValidationMessage(
                    `Ödenecek miktar 0'dan büyük olmalıdır.`
                )
            } else if (amount > data.amount - data.amountPaid) {
                Swal.showValidationMessage(
                    `Ödenecek miktar kalan borçtan küçük olmalıdır.`
                )
            } else {
                return amount;
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            data.lastAmountPaid = result.value;
            data.datePaid = data.datePaid = new Date().toDateInputValue();
            data.amountPaid = parseInt(data.amountPaid) + parseInt(result.value)
            Swal.fire(
                'Başarılı!',
                'Borç başarıyla güncellendi.',
                'success'
            )
            setData(JSON.stringify(_data));
            listData();
        }
    })
}

function editData(index) {
    let _data = getData(),
        data = _data[index];
    Swal.mixin({
        input: 'text',
        confirmButtonText: 'Sıradaki &rarr;',
        showCancelButton: true,
        cancelButtonText: "İptal",
        progressSteps: ['1', '2', '3', '4']
    }).queue([
        {
            title: 'Adı Soyadı',
            text: 'Lütfen borçlunun adını ve soyadını girin.',
            inputValue: data.name,
            preConfirm: (text) => {
                if (text) {
                    return text;
                }
                Swal.showValidationMessage(`Lütfen geçerli bir isim girin.`)
            }
        },
        {
            title: 'Borç Tutarı',
            text: 'Lütfen borç tutarı girin.',
            inputValue: data.amount,
            preConfirm: (text) => {
                if (text && text > 0) {
                    return text;
                }
                Swal.showValidationMessage(`Lütfen geçerli bir borç tutarı girin.`);
            }
        },
        {
            title: 'Toplam Ödenen Miktar',
            text: 'Lütfen toplam ödenen miktarı girin.',
            inputValue: data.amountPaid,
            preConfirm: (text) => {
                if (text && text >= 0) {
                    return text;
                }
                Swal.showValidationMessage(`Lütfen geçerli bir miktar girin.`);
            }
        },
        {
            title: 'Son Ödeme Tarihi',
            text: 'Lütfen son ödeme tarihini girin.',
            inputType: "date",
            inputValue: data.lastDate,
            preConfirm: (text) => {
                if (text && isValidDate(text)) {
                    return text;
                }
                Swal.showValidationMessage(`Lütfen geçerli bir tarih formatı girin. (YYYY-AA-GG)`);
            }
        }
    ]).then((result) => {
        if (result.value) {
            const answers = result.value;

            if (answers[2] > answers[1]) {
                showError('Ödenen miktar borç tutarından yüksek olamaz.');
            } else {
                data.name = answers[0];
                data.amount = answers[1];
                data.lastAmountPaid = answers[2] - data.amountPaid;
                data.amountPaid = answers[2];
                data.lastDate = answers[3];
                data.datePaid = new Date().toDateInputValue();
                Swal.fire(
                    'Başarılı!',
                    'Borç başarıyla güncellendi.',
                    'success'
                )
                setData(JSON.stringify(_data));
                listData();
            }
        } else {
            Swal.fire(
                'Bilgilendirme',
                'Bilgiler değiştirilmedi.',
                'info'
            )
        }
    })
}


function isValidDate(dateString) {
    var regex_date = /^\d{4}\-\d{1,2}\-\d{1,2}$/;
    if (!regex_date.test(dateString)) {
        return false;
    }
    var parts = dateString.split("-");
    var day = parseInt(parts[2], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[0], 10);
    if (year < 1000 || year > 3000 || month == 0 || month > 12) {
        return false;
    }

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
        monthLength[1] = 29;
    }
    return day > 0 && day <= monthLength[month - 1];
}

function getData() {
    !(localStorage.getItem('data')) && (localStorage.setItem('data', "[]"));
    return JSON.parse(localStorage.getItem('data'));
}

function addList(name, amount, amountPaid, lastAmountPaid, datePaid, lastDate, type) {
    let data = getData();
    let veriable = {};
    veriable.id = data.length + 1;
    veriable.name = name;
    veriable.amount = amount;
    veriable.amountPaid = amountPaid;
    veriable.lastAmountPaid = lastAmountPaid;
    veriable.datePaid = datePaid;
    veriable.lastDate = lastDate;
    veriable.type = type;
    data.push(veriable);
    setData(JSON.stringify(data));
}

function removeList(id) {
    let data = getData();
    let clean = [];
    data.forEach(function (item) {
        if (item.id != id) {
            clean.push(item);
        }
    });

    clean = reOrder(clean);
    setData(JSON.stringify(clean));
}

function reOrder(data) {
    data.forEach(function (item, index) {
        item.id = index + 1;
    });
    return data;
}


function setData(data) {
    localStorage.setItem('data', data);
}

