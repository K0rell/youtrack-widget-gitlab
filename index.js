var DEFAULT_SORT_DEPLOY = "desc";

function populateFeed(domain, projectId, privateToken, sortDeploy) {
    document.getElementById('gtlbSettings').hidden = true;
    document.getElementById('gtlbFeed').hidden = false;
    loadFeed(domain, projectId, privateToken, sortDeploy)
}

function renderSettings(dashboardAPI) {
    dashboardAPI.setTitle("Gitlab deployements list settings");

    document.getElementById('gtlbSettings').hidden = false;
    document.getElementById('gtlbFeed').hidden = true;

    document.getElementById('save').onclick = function () {
        var domain = document.getElementById('domain').value;
        var privateToken = document.getElementById('privateToken').value;
        var projectId = document.getElementById('projectId').value;
        var sortDeploy = document.getElementById('sortDeploy').value;
        dashboardAPI.storeConfig({
            domain: domain,
            privateToken: privateToken,
            projectId: projectId,
            sortDeploy: sortDeploy
        });
        dashboardAPI.exitConfigMode();
        populateFeed(domain, projectId, privateToken, sortDeploy)
    };

    document.getElementById('cancel').onclick = function () {
        dashboardAPI.setTitle("Gitlab deployements list");
        dashboardAPI.exitConfigMode();
        dashboardAPI.readConfig().then(function (config) {
            var domain = (config && config.domain) || "";
            var privateToken = (config && config.privateToken) || "";
            var projectId = (config && config.projectId) || "";
            var sortDeploy = (config && config.sortDeploy) || DEFAULT_SORT_DEPLOY;
            populateFeed(domain, projectId, privateToken, sortDeploy);
        });
    };
}

function fillFieldsFromConfig(dashboardAPI) {
    dashboardAPI.readConfig().then(function (config) {
        document.getElementById('domain').value = (config && config.domain) || "";
        document.getElementById('privateToken').value = (config && config.privateToken) || "";
        document.getElementById('projectId').value = (config && config.projectId) || "";
        document.getElementById('sortDeploy').value = (config && config.sortDeploy) || DEFAULT_SORT_DEPLOY;
    });
}

function drawFeedFromConfig(dashboardAPI) {

    dashboardAPI.readConfig().then(function (config) {

        var domain = (config && config.domain) || "";
        var privateToken = (config && config.privateToken) || "";
        var projectId = (config && config.projectId) || "";
        var sortDeploy = (config && config.sortDeploy) || DEFAULT_SORT_DEPLOY;

        dashboardAPI.setTitle("Gitlab deployments list", domain);

        populateFeed(domain, projectId, privateToken, sortDeploy);
    });
}

Dashboard.registerWidget(function (dashboardAPI, registerWidgetAPI) {
    drawFeedFromConfig(dashboardAPI);
    registerWidgetAPI({
        onConfigure: function () {
            fillFieldsFromConfig(dashboardAPI);
            renderSettings(dashboardAPI);
        },
        onRefresh: function () {
            dashboardAPI.setLoadingAnimationEnabled(true);
            drawFeedFromConfig(dashboardAPI);
            dashboardAPI.setLoadingAnimationEnabled(false);
        }
    });
});