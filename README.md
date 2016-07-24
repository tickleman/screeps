# screeps
My screeps code

# Algorithm

## Work (common to all methods)

* sourceWork(Creep) :
    * If !source_work, then always return SOURCE_WORK_OFF

    * call your canWorkSource(Creep) :
      Returns true if the creep can continue its source work, without any consideration about its source state.
      When false is returned :
        * If the creep can work at it's target, switch to the goToTarget step and stops without error.
        * Else, say 'wait' : the creep waits for someone who will make it's canWorkSource become true.

    * source() checks :
        * if the source exists anymore : if not, find the next source (call your sources if needed)
        * if the source job is done (call sourceJobDone) : if not, find the next source (call your sources if needed)

    * your sourceJobDone(Creep) :
      Returns true if the source is still available for working.

    * your sources(Creep) :
      Returns the list of available sources for this work.
      Only the first source is used for the moment.

    * If no source is available :
        * If the creep can work at it's target, switch to the goToTarget step and stops with 'no source'.
        * Else, say 'no source' : the creep waits for some available source to come back.

    * call your sourceJob(Creep) :
      The creep does the job at target, and returns the job error code or OK.
      If there is an error code not managed by the worker, the creep will say 's:error' to tell something is wrong

* targetWork(Creep) :
    * If !target_work, then always return TARGET_WORK_OFF

    * call your canWorkTarget(Creep) :
      Returns true if the creep can continue its target work, without any consideration about its target state.
      When false is returned :
        * If the creep can work at it's source, switch to the goToSource step and stops without error.
        * Else, say 'wait' : the creep waits for someone who will make it's canWorkTarget become true.

    * target() checks :
        * if the target exists anymore : if not, find the next target (call your targets if needed)
        * if the target job is done (call targetJobDone) : if not, find the next target (call your targets if needed)

    * your targetJobDone(Creep) :
      Returns true if the target is still available for working.

    * your targets(Creep) :
      Returns the list of available targets for this work.
      Only the first target is used for the moment.

    * If no target is available :
        * If the creep can work at it's source, switch to the goToSource step and stops with 'no target'.
        * Else, say 'no target' : the creep waits for some available target to come back.

    * call your targetJob(Creep) :
      The creep does the job at source, and returns the job error code or OK.
      If there is an error code not managed by the worker, the creep will say 's:error' to tell something is wrong

## Basic work

A simple not optimized basic work :
* Only sourceWork and targetWork steps. spawning, goToSource and goToTarget are automatically replaced.
* If the error on sourceWork or targetWork is ERR_NOT_IN_RANGE, then moveTo the source / target

## Rooms work

Works with tasks planned into rooms.js :
* spawning : calculates the path from the creep position to its working start position
  (not optimized, depends on where it spawned).
* goToStart : follow this path to the creep position.
* sourceWork : do the work.
* goToTarget : follow the planned path from source to target (if there is one. Else direct targetWork).
* targetWork : do the work.
* goToSource : follow the planned path from target to source (if there is one. Else direct sourceWork).

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
