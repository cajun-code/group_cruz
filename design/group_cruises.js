 // Helpers and page variables
var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
 
function getit(id)
{
       return document.getElementById(id);
}
function getADate(numDays, startDate)
{
       numDays = numDays ? numDays : 0;
       var firstDate = startDate ? new Date(startDate) : new Date("12/31/1899"); //for excel serial number format
       if(isNaN(firstDate)) return ""; //bad date format
       firstDate.setUTCDate(firstDate.getUTCDate() + numDays);
       var mo1 = firstDate.getMonth()+1; //need the month int for later
       var day = firstDate.getDate();
       var yr1 = firstDate.getFullYear(); //need year int for later
      
       day--; //account for bad calc of excel serial number, incorrectly assumed a leap year
       //get correct day if day now == 0
       if(day == 0)
       {
                   //decrement the month, which is incorrect in these cases
                   mo1 = mo1-1 == 0 ? 12 : mo1-1;
                   if(mo1 == 12) yr1--;
                   switch(mo1)
                   {
                               case 2: //feb, will need to test year as well
                                           day = yr1 == 2008 || yr1 == 2012 || yr1 == 2016 ? 29 : 28;
                               break;
                               case 4: //30 days
                               case 6:
                               case 9:
                               case 11:
                                           day = 30;
                               break;
                               default: //31 dsys
                                           day = 31;
                               break;
                   }                      
       }
       //set the month, day and year strings
       var mo = mo1.toString().length == 1 ? "0" + mo1 : mo1;
       var yr = yr1.toString();
                  
       day = day.toString().length == 1 ? "0" + day : day;
       return mo+"/"+day+"/"+yr;
}
 
//XML
var xdoc;
function XMLDOC(file, loadfcn)
{
       var xmlDoc;
       // code for IE
       if (window.ActiveXObject)
       {
                   xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
                   xmlDoc.async=false;
                   xmlDoc.load(file);
                   if(loadfcn) loadfcn();
       }
       // code for Mozilla, Firefox, Opera, etc.
       else if (document.implementation && document.implementation.createDocument)
       {
                   xmlDoc=document.implementation.createDocument("","",null);
                   xmlDoc.load(file);
                   if(loadfcn) xmlDoc.onload=loadfcn;
       }
       else
       {
                   alert('Your browser cannot handle this script');
                   return null;
       }
      
       return xmlDoc;
}
//page scripts
 
//set form selections and page xdoc var
function setFormValues()
{
       var opts;
       var selDest = getit("divDestination");
       xdoc = XMLDOC("GroupCruises.xml");
       var nodes = xdoc.selectNodes("groupcruises/groupcruise/Destination");
       selDest.innerHTML = makeOptionsFromXml("selDestination", nodes, 10, true);
      
       var selMo          = getit("divMonth");
       opts = "Any," + months.join();
       opts = opts.split(",");
       selMo.innerHTML = makeOptions("selMonth", opts, 10, true);
      
       var selYr           = getit("divYear");
       var d = new Date();
       var year = d.getFullYear();
       opts = ["Any", year, year+1, year+2, year+3];
       selYr.innerHTML = makeOptions("selYear", opts, 5, true);
      
       var selLine        = getit("divCruiseLine");
       nodes = xdoc.selectNodes("groupcruises/groupcruise/Vendor");
       selLine.innerHTML = makeOptionsFromXml("selCruiseLine", nodes, 10, true);
}
 
function makeOptions(id, opts, size, multi)
{
       size = size ? size : 10;
       var htm = "<select name='"+id+"' id='"+id+"' size='"+size+"' ";
       if(multi)
                   htm += "multiple='"+multi+"' ";
       htm += ">";
      
       for(var i=0;i<opts.length;i++)
       {
                   htm += "<option value='"+opts[i]+"'";
                   if(opts[i]=="Any")
                               htm += " selected='true' ";
                   htm += ">"+opts[i]+"</option>";
       }
       htm += "</select>";
       return htm;
}
 
function makeOptionsFromXml(id, nodes, size, multi)
{
       size = size ? size : 10;
       var htm = "<select name='"+id+"' id='"+id+"' size='"+size+"' ";
       if(multi)
                   htm += "multiple='"+multi+"' ";
       htm += ">";
       htm += "<option value='Any' selected='true'>Any</option>";
       for(var i=0;i<nodes.length;i++)
       {
                   if(htm.indexOf(nodes[i].text) == -1) //if not already added
                   {
                               htm += "<option value='"+nodes[i].text+"'";
                               htm += ">"+nodes[i].text+"</option>";
                   }
       }
       htm += "</select>";
       return htm;
}
function doReset(frm)
{
       var sels = document.getElementsByTagName("SELECT");
       for(var i=0;i<sels.length;i++)
       {
                   for(var n=0;n<sels[i].options.length;n++)
                               sels[i].options[n].selected = n==0;
       }
       getit("divResult").innerHTML = "";
       getit("divResult").style.display = "none";
}
function doSearch(frm)
{
       var selDest = frm["selDestination"];
       var destCriteria = selDest.options[0].selected ? null : getCriteriaArray(selDest);
      
       var selMo          = frm["selMonth"];
       var moCriteria = selMo.options[0].selected ? null : getCriteriaArray(selMo);
      
       var selYr           = frm["selYear"];
       var yrCriteria = selYr.options[0].selected ? null : getCriteriaArray(selYr);
      
       var selLine        = frm["selCruiseLine"];
       var lineCriteria = selLine.options[0].selected ? null : getCriteriaArray(selLine);
      
       var bDest          = destCriteria == null; //Any is selected, no criteria to test
       var bMo            = moCriteria == null;
       var bYr             = yrCriteria == null;
       var bLine           = lineCriteria == null;
      
       var htm = "";
       var nodes = xdoc.selectNodes("groupcruises/groupcruise");
       var bResult = false;
       var bAlt = true;
       for(var i=0;i<nodes.length;i++)
       {
                   //if(i<5) debugger;
                   var nodeOK = true;
                   if(!bDest)
                   {
                               nodeOK = testNode( nodes[i], "Destination", destCriteria); //test node for destination criteria
                   }
                   if(nodeOK && !bLine)
                   {
                               nodeOK = testNode( nodes[i], "Vendor", lineCriteria); //test node for cruise line criteria
                   }
                   if(nodeOK)
                   {
                               nodeOK = testNodeDate( nodes[i], moCriteria, yrCriteria);
                   }
                   if(nodeOK)
                   {          
                               bAlt = !bAlt;
                               if(bResult == false)
                               {
                                           bResult = true;
                                           htm = "<table cellpadding='3' cellspacing='0' width='100%' class='bodytextsm'>" +
                                                                   "<tr class='resultsbackground1 bodytext' style='font-weight:bold'>" +
                                                              "<td>Date</td><td>Destination</td><td>Vendor</td><td>Ship</td><td>GroupNum</td><td>Product</td>" +
                                                                   "<td>Category Fares</td><td>Amenities</td><td>Availability</td>";
                               }
                               var serialdate = nodes[i].selectSingleNode("Date").text;
                               var date = getADate(parseInt(serialdate));
                               var classname = bAlt == true ? "searchbox" : "";
                               //get data elements
                               var errtxt = "None Found";
                               var destination, vendor, ship, groupnum, product, categoryfares, amenities, availability;
                               try{destination = nodes[i].selectSingleNode("Destination").text} catch(e){destination = errtxt;}
                               try{vendor = nodes[i].selectSingleNode("Vendor").text} catch(e){vendor = errtxt;}
                               try{ship = nodes[i].selectSingleNode("Ship").text} catch(e){ship = errtxt;}
                               try{groupnum = nodes[i].selectSingleNode("GroupNum").text} catch(e){groupnum = errtxt;}
                               try{product = nodes[i].selectSingleNode("Product").text} catch(e){product = errtxt;}
                               try{categoryfares = nodes[i].selectSingleNode("CategoryFares").text} catch(e){categoryfares = errtxt;}
                               try{amenities = nodes[i].selectSingleNode("Amenities").text} catch(e){amenities = errtxt;}
                               try{availability = nodes[i].selectSingleNode("Availability").text} catch(e){availability = errtxt;}
                               try
                               {
                                           var tmphtm = "<tr valign='top' class='"+classname+"'><td>" + date + "</td>" +
                                           "<td nowrap>" + destination + "</td>" +
                                           "<td nowrap>" + vendor + "</td>" +
                                           "<td nowrap>" + ship + "</td>" +
                                           "<td nowrap>" + groupnum + "</td>" +
                                           "<td nowrap>" + product + "</td>" +
                                           "<td nowrap>" + categoryfares + "</td>" +
                                           "<td nowrap>" + amenities + "</td>" +
                                           "<td>" + availability + "</td></tr>";
                                           //"<tr class='"+classname+"'><td>&nbsp;</td><td>&nbsp;</td><td colspan='6'><b>Availability:</b> " +
                                           // nodes[i].selectSingleNode("Availability").text + "</td></tr>";
                                           htm += tmphtm; //if no exceptions are thrown
                               }
                               catch(e){msg(e.toString());}
                   }
       }
       if(bResult)
       {
                   htm += "</table>";        
                   getit("divResult").innerHTML = htm;
                   getit("divResult").style.display = "block";
       }
       else
       {
                   getit("divResult").innerHTML = "";
                   getit("divResult").style.display = "none";
                   msg("<p class='h2'>No matching results were found.</p>");
       }
      
}
var timer;
function msg(txt)
{
       getit("divMsg").innerHTML = txt == undefined ? "" : txt;
       timer = window.setTimeout(msg, 5000);
}
function testNode( parNode, fieldName, arrCriteria)
{
       var testval = parNode.selectSingleNode(fieldName).text;
       for(var i=0;i<arrCriteria.length;i++)
       {
                   if(arrCriteria[i] == testval)
                               return true;
       }
       return false;
}
 
function testNodeDate( parNode, moCriteria, yrCriteria)
{
       var numdays = parseInt(parNode.selectSingleNode("Date").text);
       var date = getADate(numdays);
       var yr = date.substr(6,4);
       var mo = date.substr(0,2);
       var yearOK = yrCriteria == null; //nothing to test
       if(!yearOK)
       {
                   for(var i=0;i<yrCriteria.length;i++)
                   {
                               if(yrCriteria[i] == yr)
                                           yearOK = true;
                   }
                   if(!yearOK) return false;
       }
      
       var moOK = moCriteria == null;
       if(moOK) return true;
      
       var getMonthInd = function (monthname)
       {
                   for(var n=0;n<months.length;n++)
                   {
                               if(months[n] == monthname)
                                           return n+1;
                   }
       }
      
       for(var i=0;i<moCriteria.length;i++)
       {
                   if(Number(mo) == getMonthInd(moCriteria[i]))
                               return true;
       }
       return false;
}
 
function getCriteriaArray(box)
{
       var selections = [];
       for(var i=1;i<box.options.length;i++)//skip the first option
       {
                   if(box.options[i].selected)
                               selections[selections.length] = box.options[i].value;
       }
       return selections.length > 0 ? selections : null;
}