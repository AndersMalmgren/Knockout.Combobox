(function () {
    ko.bindingHandlers.combobox = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = ko.utils.extend(defaultOptions, ko.utils.unwrapObservable(valueAccessor()));
            var model = new ko.bindingHandlers.combobox.ViewModel(options);
            ko.renderTemplate(comboboxTemplate, bindingContext.createChildContext(model), { templateEngine: ko.stringTemplateEngine }, element, "replaceNode");
        }
    };

    ko.bindingHandlers.flexibleTemplate = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = ko.utils.unwrapObservable(valueAccessor());
            if (document.getElementById(options.template) != null) {
                ko.renderTemplate(options.template, bindingContext.createChildContext(options.data), null, element, null);
            } else {
                ko.renderTemplate(options.template, bindingContext.createChildContext(options.data), { templateEngine: ko.stringTemplateEngine }, element, null);
            }
        }
    };

    ko.bindingHandlers.combobox.ViewModel = function (options) {
        this.options = options;
        this.searchText = ko.observable();
        this.searchText.subscribe(this.onSearch, this);

        this.dropdownVisible = ko.observable(false);
        this.dropdownItems = ko.observableArray();

        this.paging = new ko.bindingHandlers.combobox.PagingViewModel(options, this.getData.bind(this), this.dropdownItems);

        this.rowTemplate = options.rowTemplate.replace("$$valueMember&&", options.valueMember);
    };

    ko.bindingHandlers.combobox.ViewModel.prototype = {
        onSearch: function (value) {
            if (this.explicitSet) {
                return;
            }

            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(this.getData.bind(this), 200);
        },
        getData: function (page) {
            var dataSource = ko.utils.unwrapObservable(this.options.dataSource);
            if (typeof dataSource == 'function') {
                dataSource({ text: this.searchText(), page: page ? page : 0, pageSize: this.options.pageSize, total: this.paging.totalCount(), callback: this.getDataCallback.bind(this) });
            } else {
            }
        },
        getDataCallback: function (result) {
            this.dropdownItems(result.data);
            this.paging.totalCount(result.total);
            this.dropdownVisible(result.data.length > 0);
        },
        selected: function (item) {
            this.options.selected(item);
            this.hideDropdown();
            this.explicitSet = true;
            this.searchText(ko.utils.unwrapObservable(item[this.options.valueMember]));
            this.explicitSet = false;
        },
        hideDropdown: function () {
            this.dropdownVisible(false);
        },
        showDropdown: function () {
            this.dropdownVisible(true);
        },
        forceShow: function () {
            if (this.paging.itemCount() == 0) {
                this.getData();
            } else {
                this.showDropdown();
            }
        }
    };

    ko.bindingHandlers.combobox.PagingViewModel = function (options, callback, dropdownItems) {
        this.options = options;
        this.currentPage = ko.observable(0);
        this.totalCount = ko.observable();
        this.totalCount.subscribe(this.update, this);

        this.itemCount = ko.computed(function () {
            return dropdownItems().length;
        }, this);

        this.currentFloor = ko.computed(function () {
            return (this.currentPage() * options.pageSize) + 1;
        }, this);

        this.currentRoof = ko.computed(function () {
            return (this.currentPage() * options.pageSize) + this.itemCount();
        }, this);

        this.pages = ko.observableArray();

        this.show = ko.computed(function () {
            return this.options.paging && this.totalCount() > this.options.pageSize;
        }, this);

        this.callback = callback;
    };

    ko.bindingHandlers.combobox.PagingViewModel.prototype = {
        update: function (count) {
            var current = this.currentPage();
            var totalPageCount = Math.floor(count / this.options.pageSize) + 1;

            var maxLinks = Math.min(this.options.pagingLinks, totalPageCount)
            var pages = [];
            for (var i = 0; i < maxLinks; i++) {
                pages.push(this.createPage(i + current));
            }

            if (totalPageCount > this.options.pageSize) {
                pages.push(this.createPage(totalPageCount - 1));
            }

            this.pages(pages);
        },
        createPage: function (index) {
            return {
                name: index + 1,
                index: index,
                isCurrent: ko.computed(function () {
                    return index == this.currentPage()
                }, this),
                pageSelected: this.pageSelected.bind(this)
            };
        },
        pageSelected: function (page) {
            this.currentPage(page.index);
            this.callback(page.index);
            this.update(this.totalCount());
        }
    };

    //string template source engine
    ko.stringTemplateSource = function (template) {
        this.template = template;
    };

    ko.stringTemplateSource.prototype.text = function () {
        return this.template;
    };

    ko.stringTemplateEngine = new ko.nativeTemplateEngine();
    ko.stringTemplateEngine.makeTemplateSource = function (template) {
        return new ko.stringTemplateSource(template);
    };

    //Built in templates
    var comboboxTemplate = '<input data-bind="value: searchText, valueUpdate: \'afterkeydown\'"></input>\
    <button data-bind="click: forceShow">Arrow down</button>\
    <div data-bind="visible: dropdownVisible">\
        <!-- ko foreach: dropdownItems -->\
            <div data-bind="click: $parent.selected.bind($parent), flexibleTemplate: { template: $parent.rowTemplate, data: $data }"></div>\
        <!-- /ko -->\
        <div>\
            Showing <span data-bind="text: paging.currentFloor"></span>-<span data-bind="text: paging.currentRoof"></span> of <span data-bind="text: paging.totalCount"></span>\
            <div data-bind="visible: paging.show, foreach: paging.pages">\
                <button data-bind="click: pageSelected, text: name, disable: isCurrent"></button>\
            </div>\
        </div>\
    </div>';

    var rowTemplate = '<span data-bind="text: $$valueMember&&"></span>';

    defaultOptions = {
        rowTemplate: rowTemplate,
        valueMember: "name",
        pageSize: 10,
        paging: true,
        pagingLinks: 4
    };
} ());