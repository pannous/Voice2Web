// file:///home/peterk/Dokumente/quell/pannous/voice4web/spec/SpecRunner.html?
describe("ui", function() {
    it("get handler info", function() {
        var h = new JeannieHandler();
        expect({
            "handler" : "clear messages"
        }).toEqual(h.calcInfo('clear messages'));
    
        expect({
            "handler" : "default", 
            "parameters" : 'xyz no handler'
        }).toEqual(h.calcInfo('xyz no handler')); 
        
        expect({
            "handler" : "new line", 
            "parameters" : ''
        }).toEqual(h.calcInfo('new line')); 
    });
    
    it("delete line", function() {
        var h = new JeannieHandler();
        expect({
            "handler" : "clear messages"
        }).toEqual(h.calcInfo('delete all lines'));
        
        expect({
            "handler" : "delete line",
            "parameters" : 1
        }).toEqual(h.calcInfo('delete line'));

        expect({
            "handler" : "delete line",
            "parameters" : 1
        }).toEqual(h.calcInfo('delete last line'));
        
        expect({
            "handler" : "delete line",
            "parameters" : 0
        }).toEqual(h.calcInfo('delete zero lines'));
        
        expect({
            "handler" : "delete line",
            "parameters" : 4
        }).toEqual(h.calcInfo('delete last four lines'));        
        
        expect({
            "handler" : "delete line",
            "parameters" : 2
        }).toEqual(h.calcInfo('delete last 2 lines'));        
    });
    
    it("delete word", function() {
        var h = new JeannieHandler();
        expect({
            "handler" : "delete word",
            "parameters" : 1
        }).toEqual(h.calcInfo('delete last word'));
        
        expect({
            "handler" : "delete word",
            "parameters" : 3
        }).toEqual(h.calcInfo('delete last three words'));
        
        expect({
            "handler" : "delete word",
            "parameters" : 3
        }).toEqual(h.calcInfo('delete three words'));
        
        expect({
            "handler" : "delete word",
            "parameters" : 3
        }).toEqual(h.calcInfo('delete 3 words'));
    });
    
    it("is command", function() {
        var h = new JeannieHandler();
        expect(true).toEqual(h.isCommand('my command sdfij söodfh sdf', ['my command', 'message']));
        expect(true).toEqual(h.isCommand('my comman sdfij söodfh sdf message', ['my command', 'message']));
        expect(false).toEqual(h.isCommand('my comman sdfij söodfh sdf messages', ['my command', 'message']));
    });
    
    it("undo", function() {
        var h = new JeannieHandler();
        expect({
            "handler" : "undo"            
        }).toEqual(h.calcInfo('undo'));
    });
});