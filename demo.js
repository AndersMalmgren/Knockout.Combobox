ViewModel = function () {
    this.selected = ko.observable();
    this.selectedName = ko.computed(function () {
        return this.selected() != null ? this.selected().name : "";
    }, this);
}

ViewModel.prototype = {
    getData: function (options) {
        if (options.page == 0) {
            options.total = Math.floor((Math.random() * 200) + 1); 
        }

        var data = [];
        for (var i = 0; i < Math.min(options.pageSize, options.total); i++) {
            var index = (i + (options.page * options.pageSize));
            if (index == options.total) { break; }
            data.push({ name: options.text + " " + index });
        }

        options.callback({ data: data, total: options.total });
    }
};

ko.applyBindings(new ViewModel());