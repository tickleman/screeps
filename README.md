# screeps
My screeps code

## Algorithm

### Phase.start

* prepare path to their start position and work paths for :
    * harvester : get energy from source, drop it on the ground
    * carrier : get energy from harvesters, transport it to extensions, spawn, then upgraders
    * upgrader : wait for energy, upgrade the controller
* calculate optimal routes for return routes
    * carriers : one for the upgrader, one for the extensions and spawn (upgrader when has nothing else to do)
    * others creeps do not move

## Memory structure

* rooms : room_name -> room : A room for each Game.room
    * spawn : the id and position of the spawn
    * spawn_harvester : the position of the nearest to the spawn harvester (and id when alive)
    * spawn_source : the id and position of the nearest to the spawn source
    * spawn_path : the path from the harvester position to the spawn and resources, then back to the harvester position
    * controller : the id and position of the controller
    * controller_harvester : the position of the nearest to the spawn harvester (and id when alive)
    * controller_source : the id and position of the nearest to the controller source
    * controller_path : the path from the harvester position to the upgrader, then back to the harvester position

## Development environment

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
