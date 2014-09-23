var AgileGrenobleApp = AgileGrenobleApp || {};
AgileGrenobleApp.service('ProgrammeService', function($q, Slots) {
        
        var slots = {};
        var rooms = {};

        var slot_hours = [
            "8h00",
            "8h30",
            "9h00",
            "10h00",
            "10h50",
            "11h10",
            "12h10",
            "13h30",
            "13h50",
            "15h00",
            "15h50",
            "16h20",
            "17h10",
            "17h20",
            "18h10",
            "18h15",
        ];

        var MAX_SESSION_LENGTH = 1000;
        var room_length = [];
        var slot_hours_length = [];
        var row_hours_position = [];


        this.get = function() {

            var deferred = $q.defer();
           
            Slots.jsonp_query().$promise.then(
                function( datas ) {
                    prepareSlots(datas);

                    var datasDeferred = {};
                    datasDeferred.slots = slots;
                    datasDeferred.rooms = datas.rooms;
                    datasDeferred.slot_hours_length = slot_hours_length;
                    datasDeferred.row_hours_position = row_hours_position;
                    datasDeferred.slot_hours = slot_hours;
                    deferred.resolve(datasDeferred);
                },
                function( error ) {
                    alert( "Erreur lors du chargement du programme" );
                }
            );
            return deferred.promise;
       };

       var clearDatas = function(datas) {
            room_length = Array.apply(null, Array(Object.keys(datas.rooms).length)).map(function() { return 0 });
            slot_hours_length = [];
            row_hours_position = [];
            slots = {};
            rooms = {};
       }

       var prepareSlots = function(datas) {
            clearDatas(datas);

            slots = datas.slots;
            rooms = datas.rooms;

            var rowposition = 0;
            for(var index in slots) {
                var lengthmin = addGridLayoutInformationsToAllSession(slots[index], rowposition);
                slot_hours_length.push(lengthmin);
                row_hours_position.push(rowposition);
                rowposition = parseInt(rowposition) + parseInt(lengthmin);  
            }
        }

        var addGridLayoutInformationsToAllSession = function(slot, rowposition) {
            var minlength = MAX_SESSION_LENGTH;
            for (var prop in slot) {
                if (slot.hasOwnProperty(prop)) {
                    minlength = updateMinSessionLength(slot[prop], minlength);
                    if(prop == 'all') {
                        splitAndCreateAllSession(slot, slot[prop], rowposition);
                    } else {
                        addGridLayoutColumnPositionToSession(slot[prop], prop);
                        updateRoomLength(rooms[prop].id, slot[prop].length, slot[prop].width);
                    }
                    addGridLayoutRowPositionToSession(slot[prop], rowposition);
                }
            }
            return minlength;
        }

       var splitAndCreateAllSession = function(slot, session, rowposition) {
            var width = 0;
            var roomIndex = 0; 
            var isFirst = true;
            while (roomIndex < room_length.length) {
                if(room_length[roomIndex] <= rowposition) {
                    width++;
                    updateRoomLength(roomIndex, session.length, 1);
                } else {
                    isFirst = createAllSessionWithCorrectSize(session, width, isFirst, slot, roomIndex);
                    width = 0;

                }
                roomIndex++;
            }
            createAllSessionWithCorrectSize(session, width, isFirst, slot, roomIndex);
            
       }

       var createAllSessionWithCorrectSize = function(session, width, isFirst, slot, index) {
            if(width > 0) {
                var currentsession = session;
                if(isFirst == false) {
                    currentsession = JSON.parse(JSON.stringify(session));
                    slot["all"+index] = currentsession;
                }
                currentsession.colposition = index - width;
                currentsession.width = width;
                isFirst = false;
            }
            return isFirst;
       }

        var updateRoomLength = function(roomIndex, length, width) {
            for(var index = 0; index < width; index++) {
                room_length[roomIndex+index] = parseInt(room_length[roomIndex+index]) + parseInt(length);   
            }
       }

        var updateMinSessionLength = function(session, minlength) {
            if(minlength > session.length) {
                minlength = session.length;
            }
            return minlength;
        }

        var addGridLayoutRowPositionToSession = function(session, rowposition) {
            session.rowposition = rowposition.toString();
        }

       var addGridLayoutColumnPositionToSession = function(session, room) {
            session.colposition = rooms[room].id;
       }
    });