// file.js
// resposnsible for loading the resources for the application

// loads the resources for the application
// path: the path to the resource
function loadFile(path)
{
    if (path == null) {
        console.log("Path is null");
        return;
    }
    // the path needs to be formatted like ./
    // add the ./ if it is not there
    if (path[0] != '.') {
        path = "./" + path;
    }

    // check the g_static dictionary
    if (g_static[path] != undefined) {
        return g_static[path];
    }

    // not found, return an error
    console.log("Resource not found: " + path);
    return null;
}