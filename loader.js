function renderProjectInfo(projectInfo, container) {

    var div = document.createElement("div");
    div.className = "gtlbInfoProject";
    var html = "";

    html += "<strong>Project : </strong><a href='" + projectInfo.http_url_to_repo + "' target='_blank'>" + projectInfo.name + "</a> <strong>Last activity</strong> : "+ moment(projectInfo.last_activity_at).startOf('hour').fromNow() ;
    html += "</div>";
    div.innerHTML = html;
    container.appendChild(div);
}

function renderFeed(projectInfo, deployements, container) {

    for (var i = 0; i < deployements.length; i++) {
        var deployement = deployements[i];
        var deployable = deployement.deployable;
        var commit = deployable.commit;

        var div = document.createElement("div");
        div.className = "gtlbQuestion";
        var html = "<hr/>";

        html += "<button type='button' onclick='toggle(document.getElementById(\"gtlbFCM"+i+"\")); toggleText(this);'>+</button> <span class='gtlbDot gtlb" + deployable.status + "' title='" + deployable.status + "'>&#11044; </span>";
        html += moment(deployement.created_at).startOf('hour').fromNow();
        html += " by " + deployement.user.name.split(" ").map((n)=>n[0]).join(".");
        html += " <a href='" + projectInfo.web_url + "/commit/" + deployable.commit.id + "' title='" + commit.title + "' target='_blank'>" + commit.short_id + "</a>";
        html += " <a href='" + deployement.environment.external_url + "' target='_blank'>" + deployement.environment.name + "</a>";
        html += "<div id='gtlbFCM"+i+"' class='gtlbFeedCommitMessage' style='display: none;'>";

        html += "<h4>Commit title :</h4>";
        html += "<p>" + commit.title + "</p>";

        if (commit.title.replace(/[\n\r]+/g, '') !== commit.message.replace(/[\n\r]+/g, '')) {
            html += "<h4>Commit message :</h4>";
            html += "<p>" + commit.message + "</p>";
        }

        html += "</div>";
        html += "</div>";
        div.innerHTML = html;
        container.appendChild(div);
    }
}

function loadFeed(domain, projectID, privateToken, sort) {
    document.getElementById('gtlbSettings').hidden = true;
    document.getElementById('gtlbFeed').hidden = false;

    var containerInfo = document.getElementById("gtlbFeedInfo");
    containerInfo.innerHTML = "<div class='gtlbLoader'>Loading project...</div>";

    var xhrProject = new XMLHttpRequest();
    xhrProject.open('GET', domain + "/api/v4/projects/" + projectID + "?simple=true", true);
    xhrProject.setRequestHeader("PRIVATE-TOKEN", privateToken);
    xhrProject.responseType = 'json';
    xhrProject.onload = function () {
        var status = xhrProject.status;
        if (status === 200) {
            projectInfo = xhrProject.response;
            containerInfo.innerHTML = "";
            renderProjectInfo(projectInfo, containerInfo);
        } else {
            containerInfo.innerHTML = "<div class='gtlbLoader'>Failed to load project : HTTP:" + status + "</div>";

            return false;
        }
    };
    xhrProject.send();

    var containerFeedContent = document.getElementById("gtlbFeedContent");
    containerFeedContent.innerHTML = "<div class='gtlbLoader'>Loading deployement...</div>";

    var xhrDeploy = new XMLHttpRequest();
    xhrDeploy.open('GET', domain + "/api/v4/projects/" + projectID + "/deployments?sort="+sort, true);
    xhrDeploy.setRequestHeader("PRIVATE-TOKEN", privateToken);
    xhrDeploy.responseType = 'json';
    xhrDeploy.onload = function () {
        var status = xhrDeploy.status;
        if (status === 200) {
            if (xhrDeploy.response === undefined || xhrDeploy.response.length === 0) {
                containerFeedContent.innerHTML = "<div class='gtlbLoader'>No deployement found</div>";
            } else {
                containerFeedContent.innerHTML = "";
                renderFeed(projectInfo, xhrDeploy.response, containerFeedContent)
            }
        } else {
            containerFeedContent.innerHTML = "<div class='gtlbLoader'>Failed to load deployement : HTTP:" + status + "</div>";
        }
    };
    xhrDeploy.send();
}


// Show an element
var show = function (elem) {
    elem.style.display = 'block';
};

// Hide an element
var hide = function (elem) {
    elem.style.display = 'none';
};

// Toggle element visibility
var toggle = function (elem) {

    // If the element is visible, hide it
    if (window.getComputedStyle(elem).display === 'block') {
        hide(elem);
        return;
    }

    // Otherwise, show it
    show(elem);

};

function toggleText(elem)  {
    var text = elem.firstChild;
    text.data = text.data == "+" ? "-" : "+";
}