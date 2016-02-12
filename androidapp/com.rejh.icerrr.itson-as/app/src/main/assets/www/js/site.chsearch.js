if(!site){var site={};}
site.chsearch={};site.chsearch.init=function(){loggr.debug("site.chsearch.init()");site.lifecycle.add_section_history("#searchstation");site.ui.gotosection("#searchstation");$("#searchstation .main input")[0].focus();site.chsearch.results=[];site.chsearch.searchpage=0;}
site.chsearch.onpause=function(){loggr.debug("site.chsearch.onpause()");}
site.chsearch.onresume=function(){loggr.debug("site.chsearch.site.home.()");}
site.chsearch.searchstation=function(nextpage){loggr.debug("site.chsearch.searchstation()");if(!site.chsearch.searchpage){site.chsearch.searchpage=1;}
if(nextpage){site.chsearch.searchpage++;}else{site.chsearch.results=[];site.chsearch.searchpage=1;}
var name=$("#searchstation input[name='station_search']")[0].value.trim();$("#searchstation input[name='station_search']")[0].blur();if(!name){site.ui.showtoast("Station name is mandatory");return;}
site.chsearch.searchstr=name;if(!site.vars.isLoading){site.ui.showloading();}
var apiqueryobj={"get":"search_dirble_v2","search":name}
var apiaction="get";var apiquerystr=JSON.stringify(apiqueryobj);site.chsearch.searchAjaxRequestId=site.webapi.exec(apiaction,apiquerystr,function(data){if(data["error"]){site.ui.showtoast(data["errormsg"]);site.ui.hideloading();}else{for(var i in data["data"]){if(!data["data"][i]){continue;}
if(!data["data"][i].name){continue;}
loggr.log(" > Station: '"+data["data"][i].name+"'");site.chsearch.results.push(data["data"][i]);}
site.chsearch.resultsToStationData();site.ui.hideloading();}},function(error){if(site.chsearch.results){if(site.chsearch.results.length>0){site.ui.showtoast("Success! Found "+site.chsearch.results.length+" result(s)");site.chsearch.resultsToStationData();site.ui.hideloading();return;}}
if(error.message){site.ui.showtoast(error.message);loggr.log(error.message);}
else{loggr.log(error);}
site.ui.hideloading();});}
site.chsearch.searchstation_more=function(){}
site.chsearch.resultsToStationData=function(results){loggr.debug("site.chsearch.resultsToStationData()");if(!results){results=site.chsearch.results;}
if(!results){loggr.error("!results && !site.chsearch.results");}
site.chsearch.stations=[];for(var i in results){var result=results[i];loggr.log(" > "+result.name);var bestStream=site.chsearch.getBestStream(result);var bestStreamUrl=(bestStream.stream)?bestStream.stream:null;if(!bestStreamUrl){loggr.error(" -> Skip, no stream url?",{dontupload:true});continue;}
var bitrate=bestStream.bitrate;if(!bitrate){bitrate="? kbps";}
else{bitrate+="";bitrate=(bitrate.toLowerCase().indexOf("kb")>=0)?bitrate:bitrate+" kbps";}
var hostPortAndPath=site.chsearch.getHostPortAndPathFromUrl(bestStreamUrl);var station={station_id:site.helpers.genUniqueStationId(result.name).split(" ").join("_"),dirble_id:result.id,station_edited:{},station_name:result.name,station_url:bestStreamUrl,station_icon:(result.image.image.thumb.url)?result.image.image.thumb.url:null,station_image:(result.image.image.url)?result.image.image.url:null,station_host:hostPortAndPath[0],station_port:hostPortAndPath[1],station_path:hostPortAndPath[2],station_country:result.country,station_bitrate:bitrate,station_data:result}
if(result.image.image.thumb.url){loggr.error(" > Ic: "+station.station_icon,{dontupload:true});}
site.chsearch.stations.push(station);}
site.ui.showtoast("Success! Found "+site.chsearch.stations.length+" result(s)",2.5);site.chsearch.drawResults();}
site.chsearch.drawResults=function(pagenum,forceRedraw){loggr.debug("site.chsearch.drawResults()");$("#searchstation_results .title").html("Search: \""+site.helpers.short(site.chsearch.searchstr,18)+"\"");site.lifecycle.add_section_history("#searchstation_results");site.ui.gotosection("#searchstation_results");var sorter=site.sorts.station_by_none;if(site.session.sorting=="id"){sorter=site.sorts.station_by_id;}
if(site.session.sorting=="name"){sorter=site.sorts.station_by_name;}
var stations=[];stations=sorter(site.chsearch.stations);loggr.log(" > Stations: "+site.chsearch.stations.length,+",  sorted: "+stations.length);$("#searchstation_results .main").html("");if(!pagenum&&pagenum!==0){pagenum=0;}
site.session.chsearch_pagenum=pagenum;var maxitems=site.cfg.chlist.maxItemsPerBatch;var ibgn=pagenum*site.cfg.chlist.maxItemsPerBatch;var imax=(pagenum+1)*site.cfg.chlist.maxItemsPerBatch;var fragment=document.createDocumentFragment();var elems=[];for(i=0;i<stations.length;i++){var station=stations[i];if(!station){continue;}
var resultitem=document.createElement("div");resultitem.className="resultitem activatablel";resultitem.id="chlist_resultitem_"+station.station_id;resultitem.station_id=station.station_id;var resulticon=document.createElement("img");resulticon.className="resulticon shadow_z1";resulticon.src=(station.station_icon)?station.station_icon:"img/icons-80/ic_station_default.png";var resultname=document.createElement("div");resultname.className="resultname";resultname.innerHTML=station.station_name;var resultsub=document.createElement("div");resultsub.className="resultsub";resultsub.innerHTML=""
+station.station_country+", "
+site.helpers.short(station.station_url,24)+", "
+station.station_bitrate
resultitem.onclick=site.chsearch.addThisStation;resultitem.appendChild(resulticon);resultitem.appendChild(resultname);resultitem.appendChild(resultsub);fragment.appendChild(resultitem);elems.push(resultitem);}
$("#searchstation_results .main").append(fragment);site.lifecycle.onResize();}
site.chsearch.addThisStation=function(evt){loggr.debug("site.chsearch.addThisStation()");loggr.debug("site.chsearch.HACK.save()");var station_id=this.station_id;loggr.log(" > "+station_id)
site.chsearch.station_id=station_id;var stationIndex=site.helpers.session.getStationIndexById(station_id,site.chsearch.stations);var station=site.chsearch.stations[stationIndex];if(!station){loggr.error(" > !station");return;}
for(var i in site.data.stations){try{if(!site.data.stations[i].station_url){continue;}
if(station.station_url.toLowerCase()==site.data.stations[i].station_url.toLowerCase()){alert("A station with this url already exists: '"+site.data.stations[i].station_name+"'");return;}}catch(e){}}
site.chsearch.testStation(station,stationIndex);}
site.chsearch.testStationCancel=function(){site.vars.isTestingStation=false;site.chsearch.mediaPlayer.stop();site.chsearch.mediaPlayer.release();site.ui.hideloading();}
site.chsearch.testStation=function(station,stationIndex){loggr.debug("site.chsearch.testStation()");var stream_url=site.chsearch.getBestStreamUrl(station.station_data);var stream_url_hq=site.chsearch.getBestStreamUrl(station.station_data,true);if(stream_url_hq&&stream_url!=stream_url_hq){loggr.error(" -> High quality stream! > "+site.chsearch.getBestStream(station.station_data,true).bitrate,{dontupload:true});station.station_url_highquality=stream_url_hq;}
station.station_url=stream_url;site.ui.showloading("Testing...","Checking station validity");loggr.log(" > "+station.station_url);site.vars.isTestingStation=true;if(site.chsearch.station_test_timeout){clearTimeout(site.chsearch.station_test_timeout);}
site.chsearch.station_test_timeout=setTimeout(function(){site.vars.isTestingStation=false;loggr.warn(" > Station is not working");loggr.log(" > Timed out");site.chsearch.mediaPlayer.stop();site.chsearch.mediaPlayer.release();site.ui.hideloading();site.ui.showtoast("Stream did not start within a reasonable time, please choose another");},20000);site.chsearch.mediaPlayer=new Media(station.station_url,function(){},function(error){if(!site.vars.isTestingStation){return;}
loggr.warn(" > Station is not working");loggr.log(" > Errorcode: "+site.mp.getErrorByCode(error));site.chsearch.mediaPlayer.stop();site.chsearch.mediaPlayer.release();site.ui.hideloading();site.ui.showtoast("Can not play stream, please choose another");if(site.chsearch.station_test_timeout){clearTimeout(site.chsearch.station_test_timeout);}},function(status){loggr.log(" > Status: "+status+": "+site.mp.getStatusByCode(status));switch(status){case Media.MEDIA_RUNNING:site.vars.isTestingStation=false;if(site.chsearch.station_test_timeout){clearTimeout(site.chsearch.station_test_timeout);}
var streamData=site.chsearch.getBestStream(station.station_data);var infostr="\n";infostr+="\n"+"Stream info:";infostr+="\n"+"Type: "+streamData.content_type;infostr+="\n"+"Quality: "+streamData.bitrate+" kbps";if(station.station_url_highquality){var streamDataHQ=site.chsearch.getBestStream(station.station_data,true);infostr+="\n";infostr+="\n"+"High quality:";infostr+="\n"+"Type: "+streamDataHQ.content_type;infostr+="\n"+"Quality: "+streamDataHQ.bitrate+" kbps";}
if(!confirm("Add '"+station.station_name+"'?"+infostr)){site.chsearch.mediaPlayer.stop();site.chsearch.mediaPlayer.release();site.ui.hideloading();return;}
site.chsearch.mediaPlayer.stop();site.chsearch.mediaPlayer.release();station.station_data={};loggr.log(JSON.stringify(station));var addstations=[station];var newstations=site.helpers.mergeStations(site.data.stations,addstations);site.data.stations=newstations;site.chlist.setStarred(station.station_id);site.chedit.changesHaveBeenMadeGotoStarred=true;site.storage.writefile(site.cfg.paths.json,"stations.json",JSON.stringify(site.data.stations),function(evt){site.helpers.flagdirtyfile(site.cfg.paths.json+"/stations.json");site.chedit.changesHaveBeenMade=true;site.ui.showtoast("Saved!");var hasIconAndImage=(station.station_icon&&station.station_image);if(hasIconAndImage){var buttonLabels="Replace,Keep default";navigator.notification.confirm("The station you selected already has an icon set. Do you want to search and replace it?",function(buttonIndex){if(buttonIndex==1){site.chicon.init(site.chsearch.station_id);}else{site.chedit.changesHaveBeenMade=true;site.chedit.changesHaveBeenMadeGotoStarred=true;site.chlist.init(true);}},"Replace default icon?",buttonLabels);}else{site.chicon.init(site.chsearch.station_id);}},function(e){alert("Error writing to filesystem: "+site.storage.getErrorType(e));loggr.log(site.storage.getErrorType(e));});}});site.chsearch.mediaPlayer.play();}
site.chsearch.getHostPortAndPathFromUrl=function(station_url){loggr.log("site.chsearch.getHostPortAndPathFromUrl()");loggr.log(" > "+station_url);var station_host=station_url;var station_port=80;var station_path="";if(station_host.indexOf("http://")>=0){station_host=station_host.substr("http://".length);}else if(station_host.indexOf("https://")>=0){station_host=station_host.substr("https://".length);}
if(station_host.indexOf("/")>0&&station_host.indexOf(":")>0){station_port_end=station_host.indexOf("/")-station_host.indexOf(":")-1;station_path=station_host.substr(station_host.indexOf("/"));}else if(station_host.indexOf("/")<0&&station_host.indexOf(":")>0){station_port_end=station_host.length-station_host.indexOf(":")-1;station_path="/";}else{station_port_end=station_host.length-station_host.indexOf(":")-1;}
if(station_host.indexOf(":")>=0){station_port=station_host.substr(station_host.indexOf(":")+1,station_port_end);station_host=station_host.substr(0,station_host.indexOf(":"));}else if(station_host.indexOf("/")>=0){station_path=station_host.substr(station_host.indexOf("/"));station_host=station_host.substr(0,station_host.indexOf("/"));}
loggr.log(" > Host: "+station_host);loggr.log(" > Port: "+station_port);loggr.log(" > Path: "+station_path);return[station_host,station_port,station_path];}
site.chsearch.getBestStream=function(stationData,highq){loggr.log("site.chsearch.getBestStream(): "+stationData.name+", hq="+highq);var bestStream="";var streams=stationData.streams;loggr.log(" > Found "+streams.length+" stream(s)");var bestQuality=-1;for(var i=0;i<streams.length;i++){var stream=streams[i];stream.type=stream.content_type.trim().split("\n").join("").split("\r").join("").toLowerCase();loggr.log(" >> "+stream.content_type+", "+stream.stream+", "+stream.bitrate);var bitrate=(stream.bitrate)?stream.bitrate:0;if(stream.type=="audio/mpeg"){if(!highq){if(bestQuality>bitrate||!bestStream){loggr.log(" >>> SELECTED: "+stream.stream);bestStream=stream;bestQuality=bitrate;}}else{if(bestQuality<bitrate||!bestStream){loggr.log(" >>> SELECTED: "+stream.stream+" (HQ!)");bestStream=stream;bestQuality=bitrate;}}}
else if(!bestStream){}}
return bestStream;}
site.chsearch.getBestStreamUrl=function(stationData,highq){loggr.log("site.chsearch.getBestStreamUrl()");var stream=site.chsearch.getBestStream(stationData,highq);return(stream.stream)?stream.stream:"";}