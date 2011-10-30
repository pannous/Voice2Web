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
        
        expect({
            "handler" : "delete line",
            "parameters" : 1
        }).toEqual(h.calcInfo('delete line'));

//        expect({
//            "handler" : "delete line"
//        }).toEqual(h.calcInfo('delete last line'));
        
//        expect({
//            "handler" : "delete line",
//            "parameters" : 4
//        }).toEqual(h.calcInfo('delete last four lines'));
    });
});