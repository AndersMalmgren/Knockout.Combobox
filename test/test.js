ComboboxViewModel = function () {
};

ComboboxViewModel.prototype = {
    getData: function (options) {
    }
};

var defaults = function () {
    return {
        selected: ko.observable(),
        rowTemplate: ""
    }
};

asyncTest("When datasource is called", function () {
    var model = new ComboboxViewModel();
    var options = defaults();

    options.dataSource = function () {
        equal(model, this, "The keyword this should have correct scope");
        start();
    }

    var combobox = new ko.bindingHandlers.combobox.ViewModel(options, model);
    combobox.searchText("A");
});

asyncTest("When datasource is binded to other scope than ViewModel", function () {
    var model = new ComboboxViewModel();
    var options = defaults();

    options.dataSource = function () {
        equal(this, "TEST", "The keyword this should have correct scope");
        start();
    } .bind("TEST");

    var combobox = new ko.bindingHandlers.combobox.ViewModel(options, model);
    combobox.searchText("A");
});