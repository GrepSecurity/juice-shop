var sinon = require('sinon')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)

describe('fileUpload', function () {
  var fileUpload, challenges, req, res
  var save = function () { return {success: function () {}} }

  beforeEach(function () {
    fileUpload = require('../../routes/fileUpload')
    challenges = require('../../data/datacache').challenges
    res = { status: sinon.stub() }
    res.status.returns({ end: function () {} })
    req = { file: { originalname: '' } }
  })

  it('should simply end HTTP response with status 204 "No Content"', function () {
    fileUpload()(req, res)

    expect(res.status).to.have.been.calledWith(204)
  })

  describe('should not solve "uploadSizeChallenge" when file size is', function () {
    const sizes = [0, 1, 100, 1000, 10000, 99999, 100000]
    sizes.forEach(function (size) {
      it(size + ' bytes', function () {
        challenges.uploadSizeChallenge = { solved: false, save: save }
        req.file.size = size

        fileUpload()(req, res)

        expect(challenges.uploadSizeChallenge.solved).to.be.false
      })
    })
  })

  it('should solve "uploadSizeChallenge" when file size exceeds 100000 bytes', function () {
    challenges.uploadSizeChallenge = { solved: false, save: save }
    req.file.size = 100001

    fileUpload()(req, res)

    expect(challenges.uploadSizeChallenge.solved).to.be.true
  })

  it('should solve "uploadTypeChallenge" when file type is not PDF', function () {
    challenges.uploadTypeChallenge = { solved: false, save: save }
    req.file.originalname = 'hack.exe'

    fileUpload()(req, res)

    expect(challenges.uploadTypeChallenge.solved).to.be.true
  })

  it('should not solve "uploadTypeChallenge" when file type is PDF', function () {
    challenges.uploadTypeChallenge = { solved: false, save: save }
    req.file.originalname = 'hack.pdf'

    fileUpload()(req, res)

    expect(challenges.uploadTypeChallenge.solved).to.be.false
  })
})
