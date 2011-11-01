// file:///home/peterk/Dokumente/quell/pannous/voice4web/spec/SpecRunner.html?
describe("textmanager", function() {
    it("simple undo", function() {
        var tm = new TextManager();        
        expect("text").toEqual(tm.add('text').text());
        expect("text another thing").toEqual(tm.add(' another thing').text());
        expect("text").toEqual(tm.undo().text());
        expect("text another thing").toEqual(tm.redo().text());
        expect("text").toEqual(tm.undo().text());
        expect("textwow").toEqual(tm.add('wow').text());
        expect("textwow").toEqual(tm.redo().text());
    });
    
    it("more undo&redo", function() {
        var tm = new TextManager();        
        expect("text").toEqual(tm.add('text').text());
        expect("textnew").toEqual(tm.add('new').text());
        expect("textnew\ntest").toEqual(tm.add('\ntest').text());
        expect("textnew").toEqual(tm.undo().text());
        expect("text").toEqual(tm.undo().text());
        expect("textnew").toEqual(tm.redo().text());
        // forget '\ntest'
        expect("textnew\ny<").toEqual(tm.add('\ny<').text());
        expect("textnew").toEqual(tm.undo().text());
        expect("textnew\ny<").toEqual(tm.redo().text());        
        expect("textnew\ny<").toEqual(tm.redo().text());
    });
    
    it("more undo&redo", function() {
        var tm = new TextManager();        
        expect("").toEqual(tm.undo().text());
        tm = new TextManager();        
        expect("").toEqual(tm.redo().text());
    });
    
    it("clear", function() {
        var tm = new TextManager();        
        expect("text").toEqual(tm.add('text').text());
        expect("textyes").toEqual(tm.add('yes').text());
        expect("").toEqual(tm.clear().text());
        expect("again").toEqual(tm.add('again').text());
        expect("").toEqual(tm.undo().text());
        expect("textyes").toEqual(tm.undo().text());
        expect("text").toEqual(tm.undo().text());        
        expect("textyes").toEqual(tm.redo().text());
        expect("").toEqual(tm.redo().text());
    });
    
    it("empty clear", function() {
        var tm = new TextManager();        
        expect("").toEqual(tm.clear().text());
    });
    
    it("remove", function() {
        var tm = new TextManager();        
        expect("text").toEqual(tm.add('text').text());
        expect("textsdf").toEqual(tm.add('sdf').text());
        expect("texsdf").toEqual(tm.remove(3, 1).text());
        expect("texf").toEqual(tm.remove(3, 2).text());
        expect("textsdf").toEqual(tm.undo().undo().text());
    });
    
    it("empty remove", function() {
        var tm = new TextManager();        
        expect("").toEqual(tm.remove(0, 10).text());
    });
});

describe("delete last xy", function() {
    it("delete last words", function() {
        var tm = new TextManager();        
        expect("text").toEqual(tm.add('text').text());       
        expect("text pest xy").toEqual(tm.add(' pest xy').text());
        expect("text ").toEqual(tm.deleteLastXY(' ', 2).text());
        expect("text pest xy").toEqual(tm.undo().text());
        expect("text").toEqual(tm.undo().text());
    })
});