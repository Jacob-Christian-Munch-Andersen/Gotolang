//var fs=require("fs")
//var codefile=fs.readFileSync("testfile.mpl")

function parse(code,functions){
	var nocount={"(":true,")":true,"[":true,"]":true,",":true,":":true}
	var operators={"!":1,"~":1,"-":3,"+":2,"*":2,"/":2,"%":2,"&":2,"|":2,"^":2,"&&":2,"||":2,"=":2,"!=":2,">":2,"<":2,">=":2,"<=":2,"<<":2,">>":2,">>>":2}
	var precedence={"-":4,"+":4,"*":5,"/":5,"%":5,"&":5,"|":4,"^":4,"&&":2,"||":1,"=":3,"!=":3,">":3,"<":3,">=":3,"<=":3,"<<":5,">>":5,">>>":5}
	var unarypre={
		"!":"(+!"
		,"~":"(~"
		,"-":"(0|- "
	}
	var unarypost={
		"!":")"
		,"~":")"
		,"-":")"
	}
	function unaryoperator(op,code){
		return unarypre[op]+code+unarypost[op]
	}
	var binarypre={
		"-":"(0|("
		,"+":"(0|("
		,"*":"mul32("
		,"/":"div32("
		,"%":"mod32("
		,"&":"("
		,"|":"("
		,"^":"("
		,"&&":"(+!!("
		,"||":"(+!!("
		,"=":"(+("
		,"!=":"(+("
		,">":"(+("
		,"<":"(+("
		,">=":"(+("
		,"<=":"(+("
		,"<<":"shl32("
		,">>":"shl32("
		,">>>":"shru32("
	}
	var binarymid={
		"-":"- "
		,"+":"+"
		,"*":","
		,"/":","
		,"%":","
		,"&":"&"
		,"|":"|"
		,"^":"^"
		,"&&":"&&"
		,"||":"||"
		,"=":"==="
		,"!=":"!=="
		,">":">"
		,"<":"<"
		,">=":">="
		,"<=":"<="
		,"<<":","
		,">>":",- "
		,">>>":","
	}
	var binarypost={
		"-":"))"
		,"+":"))"
		,"*":")"
		,"/":")"
		,"%":")"
		,"&":")"
		,"|":")"
		,"^":")"
		,"&&":"))"
		,"||":"))"
		,"=":"))"
		,"!=":"))"
		,">":"))"
		,"<":"))"
		,">=":"))"
		,"<=":"))"
		,"<<":")"
		,">>":")"
		,">>>":")"
	}
	var binaryerror={
		"/":"Division by 0."
		,"%":"Modulo by 0."
	}
	function binaryoperator(code1,opobj,code2){
		var op=opobj.operator
		if(binaryerror[op]){
			return binarypre[op]+code1+binarymid[op]+code2+",'"+gerror(opobj.line,opobj.linepos,binaryerror[op]).replace(/\n/g,"\\n")+"'"+binarypost[op]
		}
		else{
			return binarypre[op]+code1+binarymid[op]+code2+binarypost[op]
		}
	}
	try{
		var linesraw=(code+"\nreturn").split(/\r\n?|\n\r?/)
		//var a,b
		var lineno
		var linepos
		var indent=[]
		var types=[]
		var lines=[]
		var inblockcomment=false
		var codelen=-1
		//var parsedlines=[]
		for(lineno=0;lineno<linesraw.length;lineno++){
			indent[lineno]=linesraw[lineno].replace(/[^\ \t][\s\S]*$/,"").length
			lines[lineno]=linesraw[lineno]
			if(inblockcomment){
				if(/\*\//.test(lines[lineno])){
					lines[lineno]=lines[lineno].replace(/^[\s\S]*?\*\//,"")
					inblockcomment=false
				}
				else{
					lines[lineno]=""
				}
			}
			if(!inblockcomment){
				lines[lineno]=lines[lineno].replace(/\/\*[\s\S]*?\*\//g," ")
				lines[lineno]=lines[lineno].replace(/\/\/[\s\S]*$/,"")
				if(/\/\*/.test(lines[lineno])){
					lines[lineno]=lines[lineno].replace(/\/\*[\s\S]*$/,"")
					inblockcomment=true
				}
			}
			lines[lineno]=lines[lineno]
				.replace(/([^\ \=\>\<\&\|\!])([^a-zA-Z0-9\_\ ])/g,"$1 $2")
				.replace(/([^\ \=\>\<\&\|\!])([^a-zA-Z0-9\_\ ])/g,"$1 $2")
				.replace(/\!\!/g,"! !")
				.replace(/\!\!/g,"! !")
				.replace(/([^a-zA-Z0-9\_\ ])([^\ \=\>\<\&\|])/g,"$1 $2")
				.replace(/([^a-zA-Z0-9\_\ ])([^\ \=\>\<\&\|])/g,"$1 $2")
				.replace(/^[\ \t]*|[\ \t]*$/g,"")
			lines[lineno]=lines[lineno].split(/[\ \t]+/)
			types[lineno]=[]
			if(lines[lineno][0]!==""){
				for(linepos=0;linepos<lines[lineno].length;linepos++){
					types[lineno][linepos]=itype(lines[lineno][linepos])
					if(!nocount.hasOwnProperty(types[lineno][linepos])){
						codelen++
					}
				}
			}
			//console.log(lines[lineno])
		}
		var context={v:{},args:[],parent:null,children:[],lines:[],name:"main"}
		var a
		var externalfunctions=[]
		var externalfunctionnames=[]
		for(a in functions){
			context.v["v_"+a]={type:"function",line:0,linepos:0,context:{args:{length:functions[a].args}}}
			externalfunctions.push(functions[a].fn)
			externalfunctionnames.push("v_"+a)
		}
		externalfunctionnames=externalfunctionnames.join(",")||"dummy"
		var contextstack=[context]
		var indentstack=[{type:"top",indent:-1,line:0}]
		var outdented
		var tokenerror=new Error()
		var errormessage
		for(lineno=0;lineno<types.length;lineno++){
			var ctypes=types[lineno]
			var cline=lines[lineno]
			var cindent=indent[lineno]
			linepos=0
			outdented=null
			parseline()
		}
		//console.log(lines)
		//console.log(indent)
		//console.log("-------")
		//console.log(JSON.stringify(contextstack[0],function(key, value){if(key==="parent"){return};return value},2))
		//fs.writeFileSync("debug.txt",JSON.stringify(contextstack[0],function(key, value){if(key==="parent" || key==="context"){return};return value},2))
		if(context!==contextstack[0]){
			cerror(lineno,linepos,"Compiler error: Did not end at outer level.")
		}
		var resultcounter=0
		var compiled=codegen(context)
		//console.log(compiled)
		var genfn=new Function(
			externalfunctionnames
			,"var retobj={cmd:0,depth:0,memory:0,maxdepth:0,maxmemory:0,memorylimit:100000,depthlimit:100,cmdlimit:1000000,idle:false,codelength:"+codelen+"};\n"
			//+"console.log(v_out);\n"
			+"retobj.nextcall=main(end);\n"
			+"return retobj;\n"
			+"function end(retval){retobj.result=retval;return null;};\n"
			+compiled
			+"function mul32(a,b){return 0|((a&0xffffffff)*(b&0xffff)+(a&0xffff)*(b&0xffff0000));};\n"
			+"function div32(a,b,e){if(b===0){throw new Error(e)};return Math.floor(a/b);};\n"
			+"function mod32(a,b,e){if(b===0){throw new Error(e)};b=Math.abs(b);var result=a%b;if(result<0){result+=b};return result;};\n"
			+"function shl32(a,b){if(b>=32){return 0};if(b<=-32){return a>>31};if(b<0){return a>>-b};return a<<b;};\n"
			+"function shru32(a,b){if(b>=32 || b<=-32){return 0};if(b<0){return a<<-b};return a>>>b;};\n"
			+"function dim(array,size){retobj.memory+=size-array.length;retobj.maxmemory=Math.max(retobj.maxmemory,retobj.memory);if(retobj.maxmemory>retobj.memorylimit){throw new Error('Memory limit exceeded.')};array.length=size;};\n"
			+"function setarr(array,index,value,e){if(index<0 || index>=array.length){throw new Error(e)};array[index]=value;};\n"
			+"function getarr(array,index,e){if(index<0 || index>=array.length){throw new Error(e)};return array[index]||0};\n"
		)
		return genfn.apply({},externalfunctions)
	}
	catch(e){
		if(e===tokenerror){
			return {compilationerror:errormessage}
		}
		else{
			return {compilationerror:"Unhandled compiler error: "+e.message}
		}
	}
	function parseline(){
		if(linepos>=ctypes.length){
			
		}
		else{
			if(linepos===0){
				while(true){
					var itop=indentstack[indentstack.length-1]
					if(itop.indent<cindent || (itop.type==="else" && ctypes[linepos]==="else" && itop.indent===cindent)){
						break
					}
					else{
						if(itop.indent===cindent){
							outdented=indentstack.pop()
						}
						else{
							indentstack.pop()
						}
						if(itop.type==="function"){
							context=context.parent
						}
						else if(itop.type==="if" || itop.type==="elseif" || itop.type==="else" || itop.type==="while"){
							context.lines.push([{type:"end",line:lineno,start:itop.line,starttype:itop.type}])
							itop.lineobj.end=lineno
						}
						else{
							cerror(lineno,linepos,"Compiler error: Illegal indent start.")
						}
					}
				}
			}
			var typenow=ctypes[linepos]
			var typenext=ctypes[linepos+1]
			if(typenow==="int"){
				if(typenext!=="identifier"){
					cerror(lineno,linepos+1,"Integer declaration not followed by legal identifier.")
				}
				var declid="v_"+cline[linepos+1]
				if(context.v[declid]){
					cerror(lineno,linepos+1,"Redeclaration of "+cline[linepos+1])
				}
				context.v[declid]={type:"int",line:lineno,linepos:linepos}
				linepos++
				if(ctypes[linepos+1]==="="){
					parseline()
				}
				else if(ctypes.length!==linepos+1){
					cerror(lineno,linepos+1,"Expected end of line.")
				}
			}
			else if(typenow==="arr"){
				if(typenext!=="identifier"){
					cerror(lineno,linepos+1,"Array declaration not followed by legal identifier.")
				}
				var declid="v_"+cline[linepos+1]
				if(context.v[declid]){
					cerror(lineno,linepos+1,"Redeclaration of "+cline[linepos+1])
				}
				context.v[declid]={type:"arr",line:lineno,linepos:linepos}
				if(ctypes.length!==linepos+2){
					cerror(lineno,linepos+2,"Expected end of line.")
				}
			}
			else if(typenow==="function"){
				if(typenext!=="identifier"){
					cerror(lineno,linepos+1,"Function declaration not followed by legal identifier.")
				}
				var declid="v_"+cline[linepos+1]
				if(context.v[declid]){
					cerror(lineno,linepos+1,"Redeclaration of "+cline[linepos+1])
				}
				context.v[declid]={type:"function",line:lineno,linepos:linepos}
				var oldcontext=context
				context={v:{},args:[],parent:context,children:[],lines:[],name:declid}
				oldcontext.v[declid].context=context
				oldcontext.children.push(context)
				contextstack.push(context)
				indentstack.push({type:"function",indent:cindent,line:lineno,linepos:linepos})
				if(ctypes[linepos+2]!=="("){
					cerror(lineno,linepos+2,"Expected opening parenthesis.")
				}
				linepos+=3
				if(ctypes[linepos]===")"){
					if(linepos+1!==ctypes.length){
						cerror(lineno,linepos+1,"Expected end of line.")
					}
				}
				else{
					while(true){
						if(ctypes[linepos]!=="int"){
							cerror(lineno,linepos,"Expected parameter declaration.")
						}
						linepos++
						if(ctypes[linepos]!=="identifier"){
							cerror(lineno,linepos,"Integer declaration not followed by legal identifier.")
						}
						var declid="v_"+cline[linepos]
						if(context.v[declid]){
							cerror(lineno,linepos,"Redeclaration of "+cline[linepos])
						}
						context.v[declid]={type:"int",line:lineno,linepos:linepos}
						context.args.push(declid)
						linepos++
						if(ctypes[linepos]===")"){
							if(linepos+1!==ctypes.length){
								cerror(lineno,linepos+1,"Expected end of line.")
							}
							break
						}
						if(ctypes[linepos]!==","){
							cerror(lineno,linepos,"Expected comma or closing parenthesis.")
						}
						linepos++
					}
				}
			}
			else if(typenow==="dim"){
				if(typenext!=="identifier"){
					cerror(lineno,linepos+1,"Expected identifier.")
				}
				if(ctypes[linepos+2]!=="["){
					cerror(lineno,linepos+2,"Expected opening square bracket.")
				}
				linepos+=3
				if(!ctypes[linepos]){
					cerror(lineno,linepos,"Unexpected end of line.")
				}
				context.lines.push([{type:"dim",line:lineno,linepos:linepos-3},"v_"+cline[linepos-2],parsestmt()])
				if(ctypes[linepos]!=="]"){
					cerror(lineno,linepos,"Expected closing square bracket.")
				}
				if(linepos+1!==ctypes.length){
					cerror(lineno,linepos+1,"Expected end of line.")
				}
			}
			else if(typenow==="identifier"){
				var declid="v_"+cline[linepos]
				if(typenext==="="){
					linepos+=2
					if(!ctypes[linepos]){
						cerror(lineno,linepos,"Unexpected end of line.")
					}
					context.lines.push([{type:"set",line:lineno,linepos:linepos-1},declid,parsestmt()])
					if(linepos!==ctypes.length){
						cerror(lineno,linepos,"Expected end of line.")
					}
				}
				else if(typenext==="("){
					context.lines.push([parsefunction()])
					linepos++
					if(linepos!==ctypes.length){
						cerror(lineno,linepos,"Expected end of line.")
					}
				}
				else if(typenext==="["){
					var ipos=linepos
					linepos+=2
					var index=parsestmt()
					if(ctypes[linepos]!=="]"){
						cerror(lineno,linepos,"Expected closing square bracket.")
					}
					if(ctypes[linepos+1]!=="="){
						cerror(lineno,linepos+1,"Expected equal sign.")
					}
					var setpos=linepos+1
					linepos+=2
					var value=parsestmt()
					if(linepos!==ctypes.length){
						cerror(lineno,linepos,"Expected end of line.")
					}
					context.lines.push([{type:"setarr",line:lineno,linepos:setpos,ipos:ipos},declid,index,value])
				}
				else if(typenext===":" && linepos===0){
					if(context.v[declid]){
						cerror(lineno,linepos,"Redeclaration of "+cline[linepos])
					}
					context.v[declid]={type:"label",line:lineno,linepos:linepos}
					context.lines.push([{type:"label",identifier:declid,line:lineno,linepos:linepos}])
					linepos+=2
					if(linepos!==ctypes.length){
						parseline()
					}
				}
				else{
					cerror(lineno,linepos,"Expected statement.")
				}
			}
			else if(typenow==="if" || typenow==="else" || typenow==="while" || typenow==="return"){
				var linetype=typenow
				var newlineobj
				linepos++
				if(typenow==="else" && typenext==="if"){
					linepos++
					linetype="elseif"
				}
				if(linetype==="return" && linepos===ctypes.length){
					context.lines.push([{type:linetype,line:lineno,linepos:linepos-1},[0]])
				}
				else if(linetype==="else"){
					if(linepos!==ctypes.length){
						cerror(lineno,linepos,"Expected end of line.")
					}
					context.lines.push([newlineobj={type:"else",line:lineno,linepos:linepos-1}])
				}
				else{
					if(linetype==="elseif"){
						context.lines.push([newlineobj={type:"else",line:lineno,linepos:linepos-2}])
						indentstack.push({type:"else",indent:cindent,line:lineno,linepos:linepos-2,lineobj:newlineobj})
					}
					context.lines.push([newlineobj={type:linetype,line:lineno,linepos:linepos-1},parsestmt()])
				}
				if(linetype!=="return"){
					indentstack.push({type:linetype,indent:cindent,line:lineno,linepos:linepos-1,lineobj:newlineobj})
				}
				if(linepos!==ctypes.length){
					cerror(lineno,linepos,"Expected end of line.")
				}
			}
			else if(typenow==="goto"){
				if(typenext!=="identifier"){
					cerror(lineno,linepos+1,"Expected identifier.")
				}
				linepos++
				context.lines.push([{type:"goto",line:lineno,linepos:linepos-1},"v_"+cline[linepos]])
				if(linepos+1!==ctypes.length){
					cerror(lineno,linepos+1,"Expected end of line.")
				}
			}
			else{
				cerror(lineno,linepos,"Illegal start of line.")
			}
		}
	}
	function parsefunction(){
		var fcallobj={type:"call",func:"v_"+cline[linepos],args:[],arglinepos:[],line:lineno,linepos:linepos}
		//list.push(fcallobj)
		linepos+=2
		if(ctypes[linepos]!==")"){
			while(true){
				fcallobj.arglinepos.push(linepos)
				fcallobj.args.push(parsestmt())
				if(ctypes[linepos]===")"){
					break
				}
				else if(ctypes[linepos]===","){
					linepos++
				}
				else{
					cerror(lineno,linepos,"Expected comma or closing parenthesis.")
				}
			}
		}
		return fcallobj
	}
	function parsestmt(){
		var list=[]
		list.linepos=linepos
		var expectobject=true
		while(true){
			var typenow=ctypes[linepos]
			var typenext=ctypes[linepos+1]
			if(expectobject){
				if(typenow==="number"){
					var lastitem=list[list.length-1]
					if(lastitem && lastitem.type==="unary" && lastitem.operator==="-"){
						list[list.length-1]=0|-cline[linepos]
						codelen--
					}
					else{
						list.push(0|cline[linepos])
					}
				}
				else if(typenow==="identifier"){
					if(typenext==="("){ //Function call
						list.push(parsefunction())
					}
					else if(typenext==="["){
						linepos+=2
						list.push({type:"getarr",array:"v_"+cline[linepos-2],index:parsestmt(),line:lineno,linepos:linepos-2})
						if(ctypes[linepos]!=="]"){
							cerror(lineno,linepos,"Expected closing square bracket.")
						}
					}
					else{
						list.push("v_"+cline[linepos])
					}
				}
				else if(typenow==="("){
					linepos++
					list.push(parsestmt())
					if(ctypes[linepos]!==")"){
						cerror(lineno,linepos,"Expected closing parenthesis.")
					}
				}
				else if((operators[typenow]&1)===1){
					list.push({type:"unary",operator:typenow,line:lineno,linepos:linepos})
					expectobject=false
				}
				else{
					cerror(lineno,linepos,"Expected number literal, identifier, unary operator or opening parenthesis.")
				}
			}
			else{
				if(typenow==="," || typenow===")" || typenow==="]" || linepos>=ctypes.length){
					return list
				}
				else if((operators[typenow]&2)===2){
					list.push({type:"binary",operator:typenow,precedence:precedence[typenow],line:lineno,linepos:linepos})
				}
				else{
					//throw new Error(typenow)
					cerror(lineno,linepos,"Expected binary operator or end of statement.")
				}
			}
			expectobject=!expectobject
			linepos++
		}
	}
	function codegen(context){
		var generated=[]
		generated.push("function "+context.name+"(callback"+(context.args.length?",":"")+context.args.join(",")+"){\n")
		generated.push("") //Reserve spot at index 1 for alias declarations.
		var a
		var args={}
		for(a=0;a<context.args.length;a++){
			args[context.args[a]]=true
		}
		var intcount=0
		for(a in context.v){
			if(context.v[a].type==="int" && !args[a]){
				generated.push("var "+a+"=0;\n")
			}
			if(context.v[a].type==="arr"){
				generated.push("var "+a+"=[];\n")
			}
			if(context.v[a].type==="int"){
				intcount++
			}
		}
		generated.push("var retval=0;\n")
		generated.push("retobj.memory+="+intcount+";\n")
		generated.push("retobj.depth++;\n")
		generated.push("retobj.maxmemory=Math.max(retobj.maxmemory,retobj.memory);\n")
		generated.push("retobj.maxdepth=Math.max(retobj.maxdepth,retobj.depth);\n")
		generated.push("return start;\nfunction start(){\n")
		//var breakpoints=[]
		var lineinstack
		for(lineinstack=0;lineinstack<context.lines.length;lineinstack++){
			genline(context.lines[lineinstack])
		}
		generated.push("return end;\n}\nfunction end(){\n")
		for(a in context.v){
			if(context.v[a].type==="arr"){
				generated.push("retobj.memory-="+a+".length;\n")
			}
		}
		generated.push("retobj.memory-="+intcount+";\nretobj.depth--;\nreturn callback(retval);\n};\n")
		for(a=0;a<context.children.length;a++){
			generated.push(codegen(context.children[a]))
		}
		generated.push("}\n")
		return generated.join("")
		function genline(line){
			var lineno=line[0].line
			var genlines=[]
			var linetype=line[0].type
			if(linetype==="label"){
				//breakpoints.push(lineno)
				generated.push("return label_"+line[0].identifier+";\n}\nfunction label_"+line[0].identifier+"(){\n")
			}
			else if(linetype==="goto"){
				var label=context.v[line[1]]
				if(!label || label.type!=="label"){
					cerror(lineno,line[0].linepos,"Could not find label: "+line[1]+" in function: "+context.name+".")
				}
				//line[0].toline=label.line
				generated.push("retobj.cmd++;\nreturn label_"+line[1]+";\n")
			}
			else if(linetype==="dim"){
				istype(line[1],"arr",lineno,line[0].linepos+1)
				generated.push("retobj.cmd+="+(stmtcost(line[2])+1)+";\n")
				generated.push("dim("+line[1]+","+genstmt(line[2],line[0].linepos+3)+");\n")
			}
			else if(linetype==="setarr"){
				istype(line[1],"arr",lineno,line[0].ipos)
				generated.push("retobj.cmd+="+(stmtcost(line[2])+stmtcost(line[3])+2)+";\n")
				generated.push("setarr("+line[1]+","+genstmt(line[2],line[0].ipos+2)+","+genstmt(line[3],line[0].linepos+1)+",'"+gerror(lineno,line[0].ipos+1,"Array index out of bounds.").replace(/\n/g,"\\n")+"');\n")
			}
			else if(linetype==="set"){
				istype(line[1],"int",lineno,line[0].linepos-1)
				generated.push("retobj.cmd+="+(stmtcost(line[2])+1)+";\n")
				generated.push(line[1]+"="+genstmt(line[2],line[0].linepos+1)+";\n")
			}
			else if(linetype==="if" || linetype==="elseif" || linetype==="while"){
				if(linetype==="while"){
					generated.push("return line_"+lineno+"_while;\n}\nfunction line_"+lineno+"_while(){\n")
				}
				var iffn="line_"+lineno+"_if"
				var ifnofn="line_"+line[0].end+"_if_"+lineno
				generated.push("retobj.cmd+="+(stmtcost(line[1])+1)+";\n")
				generated.push("if("+genstmt(line[1],line[0].linepos+1)+"){\nreturn "+iffn+";\n}\nelse{\nreturn "+ifnofn+";\n}\n}\nfunction "+iffn+"(){\n")
			}
			else if(linetype==="else"){
				cerror(lineno,line[0].linepos,"Else without if.")
			}
			else if(linetype==="end"){
				//console.log("-----"+line[0].starttype)
				if(line[0].starttype==="if" || line[0].starttype==="elseif"){
					var nextline=context.lines[lineinstack+1]
					if(nextline && nextline[0].type==="else"){
						
						lineinstack++
						if(nextline[0].line!==lineno){
							cerror(lineno,0,"Compiler error: End of if and else line number mismatch.")
						}
						generated.push("return line_"+nextline[0].end+"_else_"+lineno+";\n}\nfunction line_"+lineno+"_if_"+line[0].start+"(){\n")
					}
					else{
						generated.push("return line_"+lineno+"_if_"+line[0].start+";\n}\nfunction line_"+lineno+"_if_"+line[0].start+"(){\n")
					}
				}
				else if(line[0].starttype==="else"){
					generated.push("return line_"+lineno+"_else_"+line[0].start+";\n}\nfunction line_"+lineno+"_else_"+line[0].start+"(){\n")
				}
				else if(line[0].starttype==="while"){
					generated.push("return line_"+line[0].start+"_while;\n}\nfunction line_"+lineno+"_if_"+line[0].start+"(){\n")
				}
				else{
					cerror(lineno,0,"Compiler error: Illegal start type of end: "+line[0].starttype)
				}
			}
			else if(linetype==="call"){
				generated.push("retobj.cmd+="+(stmtcost(line))+";\n")
				generated.push(genstmt(line,line[0].linepos)+";\n")
			}
			else if(linetype==="return"){
				generated.push("retobj.cmd+="+(stmtcost(line[1]))+";\n")
				generated.push("retval="+genstmt(line[1],line[0].linepos+1)+";\n")
				generated.push("return end;\n")
			}
			else{
				cerror(lineno,0,"Compiler error: Illegal line type: "+linetype)
			}
			function stmtcost(stmt){
				var a,b
				var cost=0
				for(a=0;a<stmt.length;a++){
					if(stmt[a].type==="call"){
						for(b=0;b<stmt[a].args.length;b++){
							cost+=stmtcost(stmt[a].args[b])
						}
						cost+=1+stmt[a].args.length
					}
					else if(stmt[a].type==="getarr"){
						cost+=1+stmtcost(stmt[a].index)
					}
					else if(typeof stmt[a]==="object" && stmt[a].length>=0){
						cost+=stmtcost(stmt[a])
					}
					else if(stmt[a].type==="unary" || stmt[a].type==="binary"){
						cost++
					}
				}
				return cost
			}
			function genstmt(stmt,linepos){
				var calls=[]
				var tree=pickcalls(stmt)
				var gen=concat(tree)
				var a,b
				for(a=0;a<calls.length;a++){
					var args=[]
					for(b=0;b<calls[a].args.length;b++){
						args.push(genstmt(calls[a].args[b],calls[a].arglinepos[b]))
					}
					var functionname="line_"+lineno+"_"+calls[a].alias
					var callsequence="return "+calls[a].func+"("+functionname+(args.length?",":"")+args.join(",")+");\n};\nfunction "+functionname+"(returnvalue){\n"+calls[a].alias+"=returnvalue;\n"
					generated.push(callsequence)
				}
				return gen
				function pickcalls(stmt){
					var a,b
					var tree=[]
					tree.linepos=stmt.linepos
					for(a=0;a<stmt.length;a++){
						if(stmt[a].type==="call"){
							var declaration=istype(stmt[a].func,"function",lineno,stmt[a].linepos)
							if(declaration.context.args.length!==stmt[a].args.length){
								cerror(lineno,stmt[a].linepos,"Function "+stmt[a].func+" called with wrong number of arguments.")
							}
							stmt[a].alias="i_"+resultcounter
							generated[1]+="var "+stmt[a].alias+";\n"
							resultcounter++
							tree.push(stmt[a].alias)
							/*for(b=0;b<stmt[a].args;b++){
								
							}*/
							calls.push(stmt[a])
						}
						else if(stmt[a].type==="getarr"){
							istype(stmt[a].array,"arr",lineno,stmt[a].linepos-1)
							tree.push({type:"getarr",array:stmt[a].array,index:pickcalls(stmt[a].index),line:stmt[a].line,linepos:stmt[a].linepos})
						}
						else if(typeof stmt[a]==="object" && stmt[a].length>=0){
							tree.push(pickcalls(stmt[a]))
						}
						else{
							tree.push(stmt[a])
						}
					}
					return tree
				}
				function concat(tree,startat){
					var a
					var tree1=[]
					if(!(startat>=0)){
						startat=linepos
					}
					for(a=0;a<tree.length;a++){
						if(typeof tree[a]==="object" && tree[a].length>=0){
							//console.log(tree[a].linepos)
							tree[a]=concat(tree[a],tree[a].linepos)
						}
						else if(typeof tree[a]==="object" && tree[a].type==="getarr"){
							//console.log(tree[a])
							tree[a]="getarr("+tree[a].array+","+concat(tree[a].index,tree[a].linepos+1)+",'"+gerror(tree[a].line,tree[a].linepos,"Array index out of bounds.").replace(/\n/g,"\\n")+"')"
						}
					}
					for(a=tree.length-1;a>=0;a--){
						if(typeof tree[a]==="object" && tree[a].type==="unary"){
							tree1.push(unaryoperator(tree[a].operator,tree1.pop()))
						}
						else{
							if(typeof tree[a]==="string" && tree[a].substr(0,2)==="v_"){
								var posnow=startat
								if(a>0 && tree[a-1].hasOwnProperty("linepos")){
									posnow=tree[a-1].linepos+1
								}
								//console.log(tree[a-1])
								istype(tree[a],"int",lineno,posnow)
							}
							tree1.push(tree[a])
						}
					}
					var yardout=[]
					var yardstack=[]
					for(a=tree1.length-1;a>=0;a--){
						if(typeof tree1[a]==="object" && tree1[a].type==="binary"){
							prunestack(tree1[a].precedence)
							yardstack.push(tree1[a])
						}
						else if(typeof tree1[a]==="string" || typeof tree1[a]==="number"){
							yardout.push(tree1[a])
						}
						else{
							//console.log(tree1[a])
							cerror(lineno,0,"Compiler error: Unexpected ubject found during shunting yard.")
						}
					}
					prunestack(0)
					if(yardout.length!==1){
						cerror(lineno,0,"Compiler error: Leftover operands after shunting yard.")
					}
					return yardout[0]
					function prunestack(precedence){
						var a=yardstack.length-1
						while(a>=0 && yardstack[a].precedence>=precedence){
							if(yardout.length<2){
								cerror(lineno,0,"Compiler error: Not enough operands during shunting yard.")
							}
							var second=yardout.pop()
							var first=yardout.pop()
							yardout.push(binaryoperator(first,yardstack[a],second))
							yardstack.pop()
							a--
						}
					}
				}
			}
		}
		function istype(identifier,type,line,linepos){
			var testcontext=context
			while(!(testcontext.v[identifier])){
				testcontext=testcontext.parent
				if(!testcontext){
					console.log(new Error("A"))
					cerror(line,linepos,"Could not find declaration for identifier: "+identifier)
				}
			}
			if(testcontext.v[identifier].type!==type){
				cerror(line,linepos,"Identifier "+identifier+", is not type "+type+".")
			}
			return testcontext.v[identifier]
		}
	}
	function itype(str){
		if(/^\d+$/.test(str)){
			return "number"
		}
		else if(str==="int" || str==="arr" || str==="dim" || str==="function" || str==="return" || str==="if" || str==="else" || str==="goto" || str==="while" || str==="(" || str===")" || str==="[" || str==="]" || str==="," || str===":"){
			return str
		}
		else if(/^[a-zA-Z\_][a-zA-Z\_0-9]*$/.test(str)){
			return "identifier"
		}
		else if(operators.hasOwnProperty(str)){
			return str
		}
		return "invalid"
	}
	function cerror(line,token,message){
		errormessage=gerror(line,token,message)
		//console.log(errormessage)
		throw tokenerror
	}
	function gerror(line,token,message){
		return "Error on line "+(line+1)+", token "+(token+1)+": "+message+"\n\n"+pointtocode(line,token)
	}
	function pointtocode(line,token){
		var a
		var code="                              "
		var pointer=code+Array(lines[line][token].length+1).join("^")
		for(a=0;a<token;a++){
			code+=lines[line][a]+" "
		}
		code=code.slice(code.length-30)
		for(a=token;a<lines[line].length;a++){
			code+=lines[line][a]+" "
		}
		code=code.slice(0,70)
		pointer=pointer.slice(0,70)
		return code+"\n"+pointer
	}
}

function run(program){
	var interval=setInterval(execute,15)
	function execute(){
		var time=(+new Date())+10
		try{
			if(program.nextcall){
				program.nextcall=program.nextcall()
			}
			while(time>(+new Date()) && program.nextcall && !program.idle){
				var a=0
				while(program.nextcall && a<100){
					program.nextcall=program.nextcall()
					a++
				}
				if(program.maxmemory>program.memorylimit){
					throw new Error('Memory limit exceeded.')
				}
				if(program.maxdepth>program.depthlimit){
					throw new Error('Call stack depth limit exceeded.')
				}
				if(program.cmd>program.cmdlimit){
					throw new Error('Time limit exceeded.')
				}
			}
		}
		catch(e){
			program.nextcall=null
			program.error=e.message
		}
		if(!program.nextcall){
			clearInterval(interval)
			if(program.onend){
				program.onend(program.compilationerror||program.error||null,program.result)
			}
		}
		else if(program.onbatch){
			program.onbatch()
		}
	}
}