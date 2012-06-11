TextManager = function() {
    this.cachedText = undefined;
    this.work = [];
    this.maxWorkLength = 0;
}

TextManager.prototype.text = function() {
    if(this.cachedText === undefined) {        
        this.cachedText = "";        
        for(var i = 0; i < this.maxWorkLength; i+=1) {
            var w = this.work[i];
            if(w.add)
                this.applyAdd(w.text, w.index);        
            else
                this.applyRemove(w.text, w.index);
        }
    }
    return this.cachedText;
}

TextManager.prototype.clear = function() {        
    this.remove(0, this.text().length);
    return this;
}
TextManager.prototype.remove = function(fromIndex, length) {        
    if(length <= 0)
        return this;
    
    this.forget();
    var removedTxt = this.text().slice(fromIndex, fromIndex + length);
    this.applyRemove(removedTxt, fromIndex);
    this.work.push({
        'add' : false, 
        'text': removedTxt, 
        'index' : fromIndex
    });
    this.maxWorkLength += 1;
    return this;
}
TextManager.prototype.applyRemove = function(txt, index) {    
    var oldTxt = this.text();
    this.cachedText = oldTxt.slice(0, index) + oldTxt.slice(index + txt.length);
    return this;
}
// 'forget' all work greater maxWorkLength
TextManager.prototype.forget = function() {        
    if(this.maxWorkLength < this.work.length)
        this.work = this.work.slice(0, this.maxWorkLength);    
}
TextManager.prototype.add = function(txt, index) {        
    this.forget();
    this.applyAdd(txt, index);
    this.work.push({
        'add' : true, 
        'text': txt, 
        'index' : index 
    });
    this.maxWorkLength += 1;
    return this;
}

TextManager.prototype.applyAdd = function(changedTxt, index) {
    var oldTxt = this.text();
    if(index && oldTxt.length > index)
        this.cachedText = oldTxt.slice(0, index) + changedTxt + oldTxt.slice(index);
    else
        this.cachedText += changedTxt;
    return this;
}

TextManager.prototype.undo = function() {    
    if(this.maxWorkLength > 0) {
        this.cachedText = undefined;
        this.maxWorkLength -= 1;
    }
    return this;
}

TextManager.prototype.redo = function() {
    if(this.maxWorkLength < this.work.length) {
        this.cachedText = undefined;
        this.maxWorkLength += 1;
    }
    return this;
}

TextManager.prototype.deleteLastXY = function(newlineOrSpace, count) {    
    var lines = this.text();    
    var maxIndex = lines.length - 1;    
    var oldMaxIndex = maxIndex;
    for(var i = 0; i < count; i += 1) {
        while(maxIndex >= 0 && lines[maxIndex] == newlineOrSpace) {
            maxIndex -= 1;
        }
    
        while(maxIndex >= 0 && lines[maxIndex] != newlineOrSpace) {
            maxIndex -= 1;
        }        
        if(maxIndex < 0)            
            break;                
    }
    
    if(oldMaxIndex != maxIndex)
        this.remove(maxIndex + 1, lines.length - maxIndex);
        
    return this;
}
