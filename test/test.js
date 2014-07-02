ComboboxViewModel = function () {
};

ComboboxViewModel.prototype = {
    getData: function (options) {
    }
};

var defaults = function () {
    return {
        rowTemplate: "",
        valueMember: "name",
        pageSize: 10
    };
};

asyncTest("When datasource is called", function () {
    var model = new ComboboxViewModel();
    var options = defaults();

    options.dataSource = function () {
        equal(model, this, "The keyword this should have correct scope");
        start();
    }

    var combobox = new ko.bindingHandlers.combobox.ViewModel(options, model, ko.observable());
    combobox.searchText("A");
});

asyncTest("When datasource is binded to other scope than ViewModel", function () {
    var model = new ComboboxViewModel();
    var options = defaults();

    options.dataSource = function () {
        equal(this, "TEST", "The keyword this should have correct scope");
        start();
    } .bind("TEST");

    var combobox = new ko.bindingHandlers.combobox.ViewModel(options, model, ko.observable());
    combobox.searchText("A");
});

asyncTest("When text is shorter than supplied in options", function () {
    var model = new ComboboxViewModel();
    var options = defaults();
    options.minimumSearchTextLength = 2;

    options.dataSource = function () {
        ok(false, "It should not search");
    };

    setTimeout(function () {
        ok(true);
        start();
    }, 300);

    var combobox = new ko.bindingHandlers.combobox.ViewModel(options, model, ko.observable());
    combobox.searchText("A");
});

asyncTest("When text is longer than supplied in options", function () {
    var model = new ComboboxViewModel();
    var options = defaults();
    options.minimumSearchTextLength = 2;

    options.dataSource = function () {
        ok(true, "It should do search");
        start();
    };

    var combobox = new ko.bindingHandlers.combobox.ViewModel(options, model, ko.observable());
    combobox.searchText("Abc");
});

test("When no items are in list and navigating", function () {
    var model = new ComboboxViewModel();
    var options = defaults();

    var combobox = new ko.bindingHandlers.combobox.ViewModel(options, model, ko.observable());
    combobox.navigate(1);

    ok(true, "Should not throw error");
});

test("When selected is set to null", function () {
    var model = new ComboboxViewModel();
    var options = defaults();

    var selected = ko.observable({ name: "Test" });
    var combobox = new ko.bindingHandlers.combobox.ViewModel(options, model, selected);
    equal(combobox.searchText(), "Test", "The preselected value should be correct");

    selected(null);

    equal(combobox.searchText(), null, "It should have updated text in combobox");
});

asyncTest("When no items are returned", function () {
    var model = new ComboboxViewModel();
    var options = defaults();
    options.dataSource = function (options) {
        options.callback({
            data: [],
            total: 1000
        });
        start();
        equal(combobox.dropdownVisible(), true, "It should have shown dropdown");
        equal(combobox.paging.currentFloor(), 0, "Should show zero of total items in paging");
        
    };

    var combobox = new ko.bindingHandlers.combobox.ViewModel(options, model, ko.observable());
    combobox.searchText("Abc");
});

asyncTest("When selected member is a non observable", function () {
    var view = $("<div data-bind='combobox: { dataSource: getData, keyPressSearchTimeout: 0 }, comboboxValue: selected'></div>");
    view.appendTo("body");
    var model = {
        selected: null,
        getData: function (options) {
            console.log("trigger");
            options.callback({ data: [{ name: "Test"}], total: 1 });

            start();
            view.find(".active").click();
            ok(model.selected != null, "It should have updated reference");
            equal(input.val(), "Test", "Input should be updated with selected value");
            view.remove();
        }
    };

    ko.applyBindings(model, view[0]);
    var input = view.find("input").val("Foo").change();
});

test("When navigating and activeindex is higher then number of items", function () {
    var model = new ComboboxViewModel();
    var options = defaults();
    var combobox = new ko.bindingHandlers.combobox.ViewModel(options, model, ko.observable());

    combobox.dropdownItems([new ko.bindingHandlers.combobox.ItemViewModel({})]);
    combobox.dropdownVisible(true);
    combobox.currentActiveIndex = 1;
    combobox.navigate(0);
    
    ok("It should navigate without exceptions")
});