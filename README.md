# screeps
My screeps code

# Algorithm

# Memory structure

* rooms : room_name -> room : A room for each Game.room
    * spawn : {x, y, id} : the id and position of the spawn
    * spawn_source : {x, y, id} : the position and id of the nearest-to-the-spawn source
    * spawn_harvester : {x, y, role, source, [creep]} : the position, role and source of the nearest-to-the-spawn harvester
    * spawn_carrier : {path, role, source, target, [creep]} : the path from the spawn-harvester position to the spawn (and return)
    * controller : {x, y, id} : the position and id of the controller
    * controller_source : {x, y, id}, the position and id of the nearest-to-the-controller source
    * controller_harvester : {x, y, role, source, [creep]} : the position, role and source of the nearest-to-the-controller harvester
    * controller_upgrader : {x, y, rold, target, [creep]} : the position, role and source of the nearest-to-the-controller upgrader
    * controller_carrier : {path, role, source, target, {creep}} : the path from controller-harvester position to the upgrader (and return)

* creeps : creep_name -> creep : A creep for each Game.creeps
    * role : the role of the creep : used to choose the creep.role strategy
    * room : if set, the name of the room the creep is affected to (needed to free rooms memory when die)
    * room_role : if set, the role the creep is affected to in the room, reference to rooms :
                  eg spawn_harvester, spawn_carrier, controller_harvester, controller_upgrader, controller_carrier
    * source : if set, any source identification that can be used for objects.get()
    * target : if set, any target identification that can be used for objects.get()
    * step : actual step :
        * basic work : undefined, sourceWork, targetWork
        * rooms work : spawning, goToStart, goToSource, sourceWork, goToTarget, targetWork
    * path : if set, the start to go from the source to the target, then come back
    * path_step : if set, the actual move step of the creep (path[path_step]). Begins with 4.

# Development environment

I am using PhpStorm under Linux Mint (/Ubuntu/Debian).
What you need to code with screeps cleanly :

* Install node.js version 6.2+ :
    * Download from nodejs.org,
    * untar with tar xz,
    * move the node-<tab> folder into /opt/,
    * ln -s /opt/node-<tab> /opt/node to get a short easy to configure name

* Enable node.js code assistance into PhpStorm :
Search nodejs into settings : path is /opt/node/bin/node, choose path for npm, activate code assistance

* Add those external libraries do get it all work :
    * lodash : from PhpStorm javascript typescript community stubs downloads
    * ScreepsAutocomplete : git clone https://github.com/tickleman/ScreepsAutocomplete
